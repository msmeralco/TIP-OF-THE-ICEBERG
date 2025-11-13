"""Project Alisto - Automated Thermal Control System."""

import json
import re
import time
from datetime import datetime
from typing import Dict, List

import reflex as rx

from project_alisto.config import (
    COOLING_PERIOD_MINUTES,
    DEFAULT_MAX_CURRENT,
    DEFAULT_MAX_TEMPERATURE,
    MQTT_TOPIC_SOCKET_CONTROL,
    MQTT_TOPIC_SOCKET_DATA,
    MQTT_TOPIC_SOCKET_STATUS,
    NUM_SOCKETS,
)
from project_alisto.models import SocketData, ThermalEvent, ThermalLimits
from project_alisto.mqtt_client import MQTTClient
from rxconfig import config


class State(rx.State):
    """Application state for Project Alisto."""

    # Socket data (state reflects hardware status)
    sockets: Dict[int, SocketData] = {}
    
    # Thermal limits (for UI display/reference only)
    thermal_limits: ThermalLimits = ThermalLimits(
        max_temperature=DEFAULT_MAX_TEMPERATURE,
        max_current=DEFAULT_MAX_CURRENT
    )
    
    # Thermal event history
    thermal_events: List[ThermalEvent] = []
    
    # MQTT connection status
    mqtt_connected: bool = False
    
    # Thread-safe message queue for MQTT messages
    message_queue: List[tuple] = []  # List of (topic, payload) tuples
    
    # MQTT client instance
    _mqtt_client: MQTTClient = None
    
    # Notification permission status
    notification_permission_granted: bool = False

    @rx.var
    def thermal_events_count(self) -> int:
        """Get the count of thermal events."""
        return len(self.thermal_events)

    @rx.var
    def has_thermal_events(self) -> bool:
        """Check if there are any thermal events."""
        return len(self.thermal_events) > 0

    def on_load(self):
        """Initialize state on page load."""
        # Initialize sockets if not already initialized
        if not self.sockets:
            for socket_id in range(1, NUM_SOCKETS + 1):
                self.sockets[socket_id] = SocketData(socket_id=socket_id)
        
        # Initial check (periodic checks are handled by rx.interval)
        yield self.check_cooling_periods()

    def _mqtt_message_handler(self, topic: str, payload: dict):
        """MQTT message callback (called from background thread)."""
        # Add message to queue for processing by Reflex event handler
        self.message_queue.append((topic, payload))
        # Trigger processing of message queue
        self.process_message_queue()

    def connect_mqtt(self):
        """Initialize and connect to MQTT broker."""
        if self._mqtt_client is None:
            self._mqtt_client = MQTTClient(message_callback=self._mqtt_message_handler)
        
        if not self._mqtt_client.is_connected():
            success = self._mqtt_client.connect()
            if success:
                # Subscribe to all socket data and status topics
                for socket_id in range(1, NUM_SOCKETS + 1):
                    data_topic = MQTT_TOPIC_SOCKET_DATA.format(socket_id=socket_id)
                    status_topic = MQTT_TOPIC_SOCKET_STATUS.format(socket_id=socket_id)
                    self._mqtt_client.subscribe(data_topic)
                    self._mqtt_client.subscribe(status_topic)
                
                # Update connection status after a brief delay
                yield rx.sleep(0.5)
                self.mqtt_connected = self._mqtt_client.is_connected()
            else:
                self.mqtt_connected = False
        else:
            self.mqtt_connected = True

    def process_message_queue(self):
        """Reflex event handler to process queued MQTT messages."""
        if not self.message_queue:
            return
        
        # Process all messages in queue
        while self.message_queue:
            topic, payload = self.message_queue.pop(0)
            self.handle_mqtt_message(topic, payload)

    def handle_mqtt_message(self, topic: str, payload: dict):
        """Process a single MQTT message (Reflex event handler)."""
        # Extract socket ID from topic
        match = re.search(r'/socket/(\d+)/', topic)
        if not match:
            return
        
        socket_id = int(match.group(1))
        
        if socket_id not in self.sockets:
            return
        
        # Determine message type based on topic
        if '/data' in topic:
            self.process_socket_data(socket_id, payload)
        elif '/status' in topic:
            self.process_socket_status(socket_id, payload)

    def process_socket_data(self, socket_id: int, data: dict):
        """Update socket sensor data from MQTT."""
        socket = self.sockets[socket_id]
        socket.temperature = data.get("temperature", socket.temperature)
        socket.current = data.get("current", socket.current)
        socket.is_on = data.get("is_on", socket.is_on)

    def process_socket_status(self, socket_id: int, status: dict):
        """Process hardware status events from MQTT."""
        socket = self.sockets[socket_id]
        status_type = status.get("status", "")
        cooling_until = status.get("cooling_until")
        
        # Update cooling status from hardware
        if status_type == "THERMAL_SHUTDOWN":
            socket.is_cooling = True
            socket.is_on = False
            if cooling_until:
                socket.cooling_until = cooling_until
            else:
                # If no timestamp provided, calculate it (5 minutes from now)
                socket.cooling_until = time.time() + (COOLING_PERIOD_MINUTES * 60)
            
            # Add thermal event
            self.add_thermal_event(
                socket_id=socket_id,
                event_type="THERMAL_SHUTDOWN",
                message=f"Socket {socket_id} automatically shut down due to thermal limit"
            )
            
            # Send notification
            self.send_push_notification(
                title="Thermal Shutdown",
                body=f"Socket {socket_id} has been automatically shut down due to overheating"
            )
            
        elif status_type == "COOLING":
            socket.is_cooling = True
            if cooling_until:
                socket.cooling_until = cooling_until
            
        elif status_type == "NORMAL":
            socket.is_cooling = False
            socket.cooling_until = None
            
            # Check if cooling period just ended
            if socket.cooling_until is None:
                self.add_thermal_event(
                    socket_id=socket_id,
                    event_type="COOLING_ENDED",
                    message=f"Socket {socket_id} cooling period ended"
                )

    def toggle_socket(self, socket_id: int):
        """Send on/off command via MQTT (hardware enforces cooling period)."""
        if socket_id not in self.sockets:
            return
        
        socket = self.sockets[socket_id]
        command = "off" if socket.is_on else "on"
        
        topic = MQTT_TOPIC_SOCKET_CONTROL.format(socket_id=socket_id)
        payload = {"command": command}
        
        if self._mqtt_client and self._mqtt_client.is_connected():
            self._mqtt_client.publish(topic, payload)

    def shutdown_socket(self, socket_id: int):
        """Send manual shutdown command (user control only, NOT safety mechanism)."""
        if socket_id not in self.sockets:
            return
        
        topic = MQTT_TOPIC_SOCKET_CONTROL.format(socket_id=socket_id)
        payload = {"command": "off"}
        
        if self._mqtt_client and self._mqtt_client.is_connected():
            self._mqtt_client.publish(topic, payload)
            self.add_thermal_event(
                socket_id=socket_id,
                event_type="MANUAL_SHUTDOWN",
                message=f"Socket {socket_id} manually shut down by user"
            )

    def update_cooling_status(self):
        """Update UI state based on hardware-reported cooling status."""
        # This is called periodically to refresh cooling countdown
        # The actual cooling status comes from hardware via MQTT
        pass

    def check_cooling_periods(self):
        """Periodic check to refresh cooling countdown UI and MQTT connection status."""
        # Update connection status
        if self._mqtt_client:
            self.mqtt_connected = self._mqtt_client.is_connected()
            if not self.mqtt_connected:
                # Try to reconnect
                yield self.connect_mqtt()
        
        # Update cooling time remaining for all sockets
        for socket_id, socket in self.sockets.items():
            if socket.is_cooling and socket.cooling_until is not None:
                remaining = socket.cooling_until - time.time()
                if remaining <= 0:
                    socket.cooling_time_remaining = "Ready"
                else:
                    minutes = int(remaining // 60)
                    seconds = int(remaining % 60)
                    socket.cooling_time_remaining = f"{minutes}:{seconds:02d}"
            else:
                socket.cooling_time_remaining = ""
        
        # Schedule next check (recursive pattern for periodic execution)
        yield rx.sleep(1.5)
        yield self.check_cooling_periods()

    def add_thermal_event(self, socket_id: int, event_type: str, message: str = ""):
        """Log thermal events."""
        event = ThermalEvent(
            socket_id=socket_id,
            event_type=event_type,
            message=message
        )
        self.thermal_events.insert(0, event)  # Add to beginning
        
        # Keep only last 50 events
        if len(self.thermal_events) > 50:
            self.thermal_events = self.thermal_events[:50]

    def request_notification_permission(self):
        """Request browser notification permission."""
        script = """
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        """
        yield rx.call_script(script)
        # Check permission status
        check_script = """
        if ('Notification' in window) {
            return Notification.permission === 'granted';
        }
        return false;
        """
        # Note: In a real implementation, you might need to poll or use a different approach
        # For now, we'll assume permission is requested and check it when sending notifications

    def send_push_notification(self, title: str, body: str):
        """Send browser push notification."""
        # Escape quotes in title and body for JavaScript
        title_escaped = title.replace("'", "\\'").replace('"', '\\"').replace('\n', ' ')
        body_escaped = body.replace("'", "\\'").replace('"', '\\"').replace('\n', ' ')
        
        script = f"""
        if ('Notification' in window && Notification.permission === 'granted') {{
            new Notification('{title_escaped}', {{
                body: '{body_escaped}',
                icon: '/favicon.ico'
            }});
        }}
        """
        yield rx.call_script(script)

    def get_cooling_time_remaining(self, socket_id: int) -> str:
        """Get remaining cooling time as formatted string."""
        if socket_id not in self.sockets:
            return ""
        
        socket = self.sockets[socket_id]
        if not socket.is_cooling or socket.cooling_until is None:
            return ""
        
        remaining = socket.cooling_until - time.time()
        if remaining <= 0:
            return "Ready"
        
        minutes = int(remaining // 60)
        seconds = int(remaining % 60)
        return f"{minutes}:{seconds:02d}"

    def get_socket_status_color(self, socket_id: int) -> str:
        """Get status color for socket based on temperature/current."""
        if socket_id not in self.sockets:
            return "gray"
        
        socket = self.sockets[socket_id]
        
        if socket.is_cooling:
            return "orange"
        
        if socket.temperature >= self.thermal_limits.max_temperature * 0.9:
            return "red"
        elif socket.temperature >= self.thermal_limits.max_temperature * 0.7:
            return "yellow"
        
        if socket.current >= self.thermal_limits.max_current * 0.9:
            return "red"
        elif socket.current >= self.thermal_limits.max_current * 0.7:
            return "yellow"
        
        return "green"


def index() -> rx.Component:
    """Main dashboard page."""
    from project_alisto.components.socket_card import socket_card
    from project_alisto.components.thermal_alerts import thermal_alerts
    
    return rx.container(
        rx.color_mode.button(position="top-right"),
        rx.vstack(
            # Header
            rx.hstack(
                rx.heading("Project Alisto", size="9"),
                rx.spacer(),
                rx.hstack(
                    rx.badge(
                        rx.cond(
                            State.mqtt_connected,
                            "Connected",
                            "Disconnected"
                        ),
                        color_scheme=rx.cond(
                            State.mqtt_connected,
                            "green",
                            "red"
                        )
                    ),
                    rx.button(
                        "Connect MQTT",
                        on_click=State.connect_mqtt,
                        disabled=State.mqtt_connected,
                        size="2",
                    ),
                    spacing="3",
                ),
                width="100%",
                align="center",
            ),
            
            # Thermal limits configuration panel
            rx.card(
                rx.vstack(
                    rx.heading("Thermal Limits (Display Only)", size="5"),
                    rx.hstack(
                        rx.vstack(
                            rx.text("Max Temperature", size="2"),
                            rx.text(
                                f"{State.thermal_limits.max_temperature:.0f}°C",
                                size="4",
                                weight="bold"
                            ),
                            align="start",
                        ),
                        rx.vstack(
                            rx.text("Max Current", size="2"),
                            rx.text(
                                f"{State.thermal_limits.max_current:.0f}A",
                                size="4",
                                weight="bold"
                            ),
                            align="start",
                        ),
                        spacing="6",
                    ),
                    rx.text(
                        "Note: Actual safety limits are enforced by hardware firmware",
                        size="1",
                        color="gray",
                        font_style="italic",
                    ),
                    spacing="3",
                    width="100%",
                ),
                width="100%",
                padding="4",
            ),
            
            # Socket cards grid
            rx.heading("Socket Status", size="7", margin_top="4"),
            rx.grid(
                *[socket_card(socket_id) for socket_id in range(1, NUM_SOCKETS + 1)],
                columns="2",
                spacing="4",
                width="100%",
            ),
            
            # Thermal alerts section
            rx.heading("Thermal Events", size="7", margin_top="4"),
            thermal_alerts(),
            
            spacing="6",
            width="100%",
            padding="6",
            max_width="1400px",
        ),
        width="100%",
        on_mount=[
            State.connect_mqtt,
            State.request_notification_permission,
        ],
    )


app = rx.App()
app.add_page(index)
