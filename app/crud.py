from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json

from . import models, schemas, security, services
from .config import settings


# --- User ---
# (This section is unchanged)

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
# (This section is unchanged)

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
# (This section is unchanged)

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


# --- Device Log (MODIFIED) ---

def create_device_log(db: Session, device_id: str, data: schemas.DeviceDataPayload):
    """
    MODIFIED: Creates a new log entry by mapping the
    nested payload (data.current_a) to the flat database columns.
    """
    log_entry = models.DeviceLog(
        device_id=device_id,
        ambient_temperature=data.ambient_temperature,
        smoke=data.smoke,
        fire_reading=data.fire_reading,

        # Map from nested payload to flat database model
        socket1_current_a=data.current_a.s1,
        socket2_current_a=data.current_a.s2,
        socket3_current_a=data.current_a.s3,
        socket4_current_a=data.current_a.s4
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


# --- Alerts ---
# (This section is unchanged)

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


# --- Reports (MODIFIED & BROKEN) ---

def get_device_consumption(db: Session, device: models.Device, start_time: datetime, end_time: datetime):
    """
    WARNING: This function is now broken. The database no longer stores
    'energy_kwh' data. It now stores 'current_a'.

    You must update this function to query the new 'socketX_current_a'
    columns and decide how to report that data. You cannot calculate
    'total_cost' from Amps (current) alone.
    """
    raise NotImplementedError(
        "Cannot calculate consumption. Database model changed from 'energy_kwh' to 'current_a'. "
        "This function must be rewritten."
    )

    # --- OLD BROKEN CODE ---
    # query = db.query(
    #     func.sum(models.DeviceLog.socket1_energy_kwh).label("s1_total"),
    #     ...
    # )
    # ...


def get_user_bill_estimate(db: Session, user: models.User, start_time: datetime):
    """
    WARNING: This function is now broken. The database no longer stores
    'energy_kwh' data. It now stores 'current_a'.

    You cannot estimate a bill from Current (Amps) without Voltage.
    This function must be rewritten.
    """
    raise NotImplementedError(
        "Cannot estimate bill. Database model changed from 'energy_kwh' to 'current_a'. "
        "This function must be rewritten."
    )

    # --- OLD BROKEN CODE ---
    # query = db.query(
    #     func.sum(models.DeviceLog.socket1_energy_kwh +
    #              models.DeviceLog.socket2_energy_kwh +
    #              ...)
    # )
    # ...
