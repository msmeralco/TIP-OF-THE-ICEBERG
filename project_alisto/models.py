"""Data models for Project Alisto."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


# NEW: Model for storing historical sensor readings
class SocketDataHistory(rx.Model, table=True):
    id: Optional[int] = rx.Field(default=None, primary_key=True)
    socket_id: int = rx.Field(index=True)
    timestamp: datetime = rx.Field(default_factory=datetime.now, index=True)
    temperature: float = 0.0
    current: float = 0.0

@dataclass
class SocketData:
    """Socket sensor data and status from hardware."""
    socket_id: int
    temperature: float = 0.0
    current: float = 0.0
    is_on: bool = False
    is_cooling: bool = False
    cooling_until: Optional[float] = None  # Unix timestamp from hardware
    cooling_time_remaining: str = ""  # Formatted time remaining string


@dataclass
class ThermalLimits:
    """Thermal limits for UI display/reference only."""
    max_temperature: float = 60.0  # Celsius
    max_current: float = 15.0  # Amperes


@dataclass
class ThermalEvent:
    """Thermal event log entry."""
    id: Optional[int] = rx.Field(default=None, primary_key=True)
    socket_id: int = rx.Field(index=True)
    event_type: str
    timestamp: datetime = rx.Field(default_factory=datetime.now)
    message: str = ""

