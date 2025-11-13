from .models import SocketData, ThermalEvent
from typing import Optional, Tuple


def handle_socket_status(
        current_socket: SocketData, message: dict
) -> Tuple[SocketData, Optional[ThermalEvent]]:
    """
    Processes a status message and returns the updated socket state
    and an optional new thermal event.
    This function is PURE and has NO side effects.
    """
    new_event = None
    if message["status"] == "THERMAL_SHUTDOWN":
        current_socket.is_on = False
        current_socket.is_cooling = True
        current_socket.cooling_until = message["cooling_until"]
        new_event = ThermalEvent(
            socket_id=current_socket.socket_id,
            event_type="THERMAL_SHUTDOWN",
            timestamp=message["timestamp"],
            message=f"Socket {current_socket.socket_id} auto-shutdown."
        )
    elif message["status"] == "NORMAL":
        current_socket.is_cooling = False
        current_socket.cooling_until = None

    return current_socket, new_event
