from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# --- Token ---
# No changes needed
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


# --- User ---
# No changes needed. The 'devices' field will just
# return the new 'Device' schema below.
class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    devices: List['Device'] = []  # Forward reference

    class Config:
        from_attributes = True


# --- Socket ---
# This section is heavily modified.

class SocketBase(BaseModel):
    status: str


class Socket(SocketBase):
    """
    CHANGED: This is now a simple schema.
    It only represents the metadata and state of a socket.
    All sensor/energy data is in the DeviceLog.
    """
    id: int
    device_id: str
    socket_index: int  # ADDED: To identify as Socket 1, 2, 3, or 4
    last_shutdown: Optional[datetime] = None

    # REMOVED: temperature, current, voltage, power

    class Config:
        from_attributes = True


class SocketControl(BaseModel):
    """
    CHANGED: We now control the socket by its 'socket_index' (1-4)
    and its parent 'device_id', not its unique 'id'.
    This is much more intuitive for the ESP32.
    """
    device_id: str
    socket_index: int
    status: str  # 'on' or 'off'


# --- Device ---
# This section is modified to use the new Socket schema.

class DeviceBase(BaseModel):
    id: str  # The unique device ID (e.g., MAC Address)


class DeviceRegister(DeviceBase):
    pass


class Device(DeviceBase):
    """
    CHANGED: The 'sockets' list will now contain the
    new, simplified Socket schema.
    """
    owner_id: int
    status: str
    last_heartbeat: Optional[datetime] = None
    sockets: List[Socket] = []  # This will now use the new Socket schema

    class Config:
        from_attributes = True


# Re-update User to resolve forward reference
User.model_rebuild()


# --- NEW: Device Log Schemas ---
# Added to represent your unified data packets.

class DeviceDataPayload(BaseModel):
    """
    This schema validates the incoming MQTT packet from the ESP32.
    It perfectly matches your non-negotiable data structure.
    """
    # Device-Level Sensors
    ambient_temperature: float
    smoke: float
    fire_reading: float

    # Socket-Level Energy (Per Interval)
    socket1_energy_kwh: float
    socket2_energy_kwh: float
    socket3_energy_kwh: float
    socket4_energy_kwh: float


class DeviceLog(DeviceDataPayload):
    """
    This is the response model for sending log history to the user.
    It includes the database ID and timestamp.
    """
    id: int
    device_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Reports ---
# This section is modified for the new data structure.

class FireAlert(BaseModel):
    id: int
    device_id: str
    timestamp: datetime
    severity: str
    sensor_readings: str

    class Config:
        from_attributes = True


class DeviceConsumptionReport(BaseModel):
    device_id: str
    period_start: datetime
    period_end: datetime

    # Per-socket totals
    socket1_total_kwh: float
    socket2_total_kwh: float
    socket3_total_kwh: float
    socket4_total_kwh: float

    # Grand totals
    total_kwh: float
    total_cost: float


class BillEstimate(BaseModel):
    # No changes needed. The schema is the same,
    # but the calculation in crud.py will be different.
    estimated_bill: float
