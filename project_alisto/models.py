"""Data models for Project Alisto."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


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
    socket_id: int
    event_type: str  # e.g., "THERMAL_SHUTDOWN", "COOLING_STARTED", "COOLING_ENDED"
    timestamp: datetime = field(default_factory=datetime.now)
    message: str = ""
    formatted_timestamp: str = field(default="")
    
    def __post_init__(self):
        """Format timestamp after initialization."""
        if not self.formatted_timestamp:
            self.formatted_timestamp = self.timestamp.strftime("%Y-%m-%d %H:%M:%S")

