# --- In tests/test_logic.py ---
from project_alisto.logic import handle_socket_status
from project_alisto.models import SocketData
import time

def test_handle_thermal_shutdown():
    # 1. ARRANGE
    initial_socket = SocketData(socket_id=1, temperature=25.0, current=1.0, is_on=True)
    shutdown_msg = {
        "status": "THERMAL_SHUTDOWN",
        "cooling_until": time.time() + 300,
        "timestamp": time.time()
    }

    # 2. ACT
    updated_socket, new_event = handle_socket_status(initial_socket, shutdown_msg)

    # 3. ASSERT
    assert updated_socket.is_on is False
    assert updated_socket.is_cooling is True
    assert updated_socket.cooling_until == shutdown_msg["cooling_until"]
    assert new_event is not None
    assert new_event.event_type == "THERMAL_SHUTDOWN"