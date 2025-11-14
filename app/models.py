from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    devices = relationship("Device", back_populates="owner")


class Device(Base):
    __tablename__ = "devices"
    id = Column(String, primary_key=True, index=True)  # Unique device ID (e.g., MAC address)
    owner_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="online")  # online/offline
    last_heartbeat = Column(DateTime)

    owner = relationship("User", back_populates="devices")

    # A device has exactly 4 sockets.
    # cascade="all, delete-orphan" means if you delete a Device, its 4 Sockets are also deleted.
    sockets = relationship(
        "Socket",
        back_populates="device",
        cascade="all, delete-orphan"
    )

    # A device has a history of log entries.
    logs = relationship(
        "DeviceLog",
        back_populates="device",
        cascade="all, delete-orphan"
    )

    # A device can have fire alerts triggered.
    alerts = relationship(
        "FireAlert",
        back_populates="device",
        cascade="all, delete-orphan"
    )


class Socket(Base):
    """
    Represents one of the 4 sockets on a device.
    This table only stores the socket's NAME (e.g., "Electric Fan")
    and its current STATE (on/off).

    All sensor data and consumption data is in the 'DeviceLog' table.
    """
    __tablename__ = "sockets"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)

    # The index (1, 2, 3, or 4) to identify which socket this is.
    socket_index = Column(Integer, nullable=False)
    status = Column(String, default="off")  # on/off
    last_shutdown = Column(DateTime, nullable=True)  # For thermal/cooling logic

    device = relationship("Device", back_populates="sockets")

    # This constraint ensures a device cannot have two "Socket 1s".
    __table_args__ = (
        UniqueConstraint('device_id', 'socket_index', name='_device_socket_uc'),
    )


class DeviceLog(Base):
    __tablename__ = "device_logs"
    id = Column(Integer, primary_key=True, index=True)

    # THIS IS THE CRITICAL LINE THAT FIXES THE MAPPER ERROR
    device_id = Column(String, ForeignKey("devices.id"), nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # --- Device-Level Sensors ---
    ambient_temperature = Column(Float)
    smoke = Column(Float)
    fire_reading = Column(Float)

    # --- Socket-Level Current (Per Interval) ---
    # These are the corrected column names to match your MQTT payload schema
    socket1_current_a = Column(Float)
    socket2_current_a = Column(Float)
    socket3_current_a = Column(Float)
    socket4_current_a = Column(Float)

    # This relationship links it back to the Device class
    device = relationship("Device", back_populates="logs")


class FireAlert(Base):
    """
    This table is unchanged. It still stores an "event" triggered
    when smoke/fire readings from a DeviceLog are too high.
    """
    __tablename__ = "fire_alerts"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, ForeignKey("devices.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String)  # pre-fire, fire, critical
    sensor_readings = Column(String)  # JSON string of the log that triggered this

    device = relationship("Device", back_populates="alerts")
