from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json

from . import models, schemas, security, services
from .config import settings


# --- User ---

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- Device ---

def register_device(db: Session, device: schemas.DeviceRegister, user_id: int):
    """
    CHANGED: Creates the device and its 4 default socket entries.
    """
    db_device = models.Device(
        id=device.device_id,
        owner_id=user_id,
        last_heartbeat=datetime.utcnow()
    )
    db.add(db_device)

    # Commit the device first to get its ID
    db.commit()

    # Create 4 sockets (indices 1-4) linked to this device
    for i in range(1, 5):
        socket = models.Socket(
            device_id=db_device.id,
            socket_index=i,
            name=f"Socket {i}"
        )
        db.add(socket)

    db.commit()
    db.refresh(db_device)
    return db_device


def get_user_devices(db: Session, user_id: int):
    return db.query(models.Device).filter(models.Device.owner_id == user_id).all()


def get_device_by_id(db: Session, device_id: str):
    return db.query(models.Device).filter(models.Device.id == device_id).first()


def update_device_heartbeat(db: Session, device: models.Device, status: str = "online"):
    device.last_heartbeat = datetime.utcnow()
    device.status = status
    db.commit()


# --- Socket ---

def get_device_sockets(db: Session, device_id: str):
    """
    Returns the 4 socket entries for a device.
    """
    return db.query(models.Socket).filter(models.Socket.device_id == device_id).order_by(
        models.Socket.socket_index).all()


def get_socket_by_device_and_index(db: Session, device_id: str, socket_index: int):
    """
    NEW: Gets a single socket using its device ID and index (1-4).
    """
    return db.query(models.Socket).filter(
        models.Socket.device_id == device_id,
        models.Socket.socket_index == socket_index
    ).first()


def update_socket_status(db: Session, socket: models.Socket, status: str):
    """
    CHANGED: Logic is the same, but this is now only called by control_socket.
    """
    socket.status = status
    if status == "off":
        socket.last_shutdown = datetime.utcnow()
    else:
        # Clear the shutdown time if it's turned on
        socket.last_shutdown = None
    db.commit()
    db.refresh(socket)
    return socket


# --- Device Log (New) ---

def create_device_log(db: Session, device_id: str, data: schemas.DeviceDataPayload):
    """
    NEW: Creates a new, unified log entry from an MQTT packet.
    """
    log_entry = models.DeviceLog(
        device_id=device_id,
        ambient_temperature=data.ambient_temperature,
        smoke=data.smoke,
        fire_reading=data.fire_reading,
        socket1_energy_kwh=data.socket1_energy_kwh,
        socket2_energy_kwh=data.socket2_energy_kwh,
        socket3_energy_kwh=data.socket3_energy_kwh,
        socket4_energy_kwh=data.socket4_energy_kwh
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


# --- Alerts ---

def create_fire_alert(db: Session, device_id: str, severity: str, data: dict):
    """
    CHANGED: 'data' is now a dict, which we serialize to JSON.
    """
    alert = models.FireAlert(
        device_id=device_id,
        severity=severity,
        sensor_readings=json.dumps(data)  # Serialize dict to JSON string
    )
    db.add(alert)
    db.commit()
    return alert


def get_user_alerts(db: Session, user_id: int):
    return db.query(models.FireAlert).join(models.Device).filter(models.Device.owner_id == user_id).all()


# --- Reports ---

def get_device_consumption(db: Session, device: models.Device, start_time: datetime, end_time: datetime):
    """
    NEW: Queries the DeviceLog to sum energy for all 4 sockets.
    """
    # Define the query to sum all energy columns
    query = db.query(
        func.sum(models.DeviceLog.socket1_energy_kwh).label("s1_total"),
        func.sum(models.DeviceLog.socket2_energy_kwh).label("s2_total"),
        func.sum(models.DeviceLog.socket3_energy_kwh).label("s3_total"),
        func.sum(models.DeviceLog.socket4_energy_kwh).label("s4_total")
    ).filter(
        models.DeviceLog.device_id == device.id,
        models.DeviceLog.timestamp >= start_time,
        models.DeviceLog.timestamp <= end_time
    )

    # Execute the query
    result = query.first()

    # Handle case where there is no data (result will be None or contain None)
    s1_total = result.s1_total or 0.0
    s2_total = result.s2_total or 0.0
    s3_total = result.s3_total or 0.0
    s4_total = result.s4_total or 0.0

    total_kwh = s1_total + s2_total + s3_total + s4_total
    total_cost = total_kwh * services.get_meralco_rate()

    return schemas.DeviceConsumptionReport(
        device_id=device.id,
        period_start=start_time,
        period_end=end_time,
        socket1_total_kwh=s1_total,
        socket2_total_kwh=s2_total,
        socket3_total_kwh=s3_total,
        socket4_total_kwh=s4_total,
        total_kwh=total_kwh,
        total_cost=total_cost
    )


def get_user_bill_estimate(db: Session, user: models.User, start_time: datetime):
    """
    CHANGED: Queries DeviceLog for all user's devices to estimate bill.
    """
    total_kwh = 0.0

    # Get all device IDs for the user
    device_ids = [device.id for device in user.devices]

    if not device_ids:
        return {"estimated_bill": 0.0}

    # Query the sum of all energy columns for all devices of this user
    query = db.query(
        func.sum(models.DeviceLog.socket1_energy_kwh +
                 models.DeviceLog.socket2_energy_kwh +
                 models.DeviceLog.socket3_energy_kwh +
                 models.DeviceLog.socket4_energy_kwh)
    ).filter(
        models.DeviceLog.device_id.in_(device_ids),
        models.DeviceLog.timestamp >= start_time
    )

    result = query.scalar()  # scalar() returns the single value

    if result:
        total_kwh = result

    monthly_estimate = total_kwh * services.get_meralco_rate()
    return {"estimated_bill": monthly_estimate}