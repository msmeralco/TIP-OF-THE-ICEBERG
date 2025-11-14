from pydantic import BaseModel, Field
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
# No changes needed
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

# NEW: This schema matches the nested {"s1": ..., "s2": ...}
# object in your device payload.
class SocketCurrents(BaseModel):
    s1: float
    s2: float
    s3: float
    s4: float

class SocketBase(BaseModel):
    status: str


class Socket(SocketBase):
    """
    This is now a simple schema.
    It only represents the metadata and state of a socket.
    All sensor/energy data is in the DeviceLog.
    """
    id: int
    device_id: str
    socket_index: int  # ADDED: To identify as Socket 1, 2, 3, or 4
    last_shutdown: Optional[datetime] = None

    class Config:
        from_attributes = True


class SocketControl(BaseModel):
    """
    We now control the socket by its 'socket_index' (1-4)
    and its parent 'device_id', not its unique 'id'.
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
    The 'sockets' list will now contain the
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


# --- MODIFIED: Device Log Schemas ---

class DeviceDataPayload(BaseModel):
    """
    This schema validates the incoming MQTT packet from the ESP32.
    It now matches your device's exact JSON structure.
    """
    # Device-Level Sensors
    ambient_temperature: float
    smoke: float
    fire_reading: float

    # This expects the nested "current_a" object
    current_a: SocketCurrents

    class Config:
        # This will ignore extra fields like "device_id" and "uptime_ms"
        # that are in the payload but not needed for validation.
        extra = "ignore"


class DeviceLog(BaseModel):
    """
    This is the *only* DeviceLog schema.
    It is the response model for sending log history to the user,
    matching the new flat database structure.
    """
    id: int
    device_id: str
    timestamp: datetime
    ambient_temperature: float
    smoke: float
    fire_reading: float

    # These fields match the new columns in your 'device_logs' DB table
    socket1_current_a: float
    socket2_current_a: float
    socket3_current_a: float
    socket4_current_a: float

    class Config:
        from_attributes = True


# --- Reports ---
# WARNING: These schemas are now *outdated* as they
# refer to 'kwh' and 'cost', which your device is not
# providing. Your reporting endpoints will fail until
# you update them to use the 'current_a' data.

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
    estimated_bill: float