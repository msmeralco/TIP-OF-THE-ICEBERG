"""MQTT client wrapper for Project Alisto."""

import json
import logging
import threading
from typing import Callable, Optional

import paho.mqtt.client as mqtt

from project_alisto.config import (
    MQTT_BROKER_HOST,
    MQTT_BROKER_PORT,
    MQTT_CLIENT_ID,
    MQTT_PASSWORD,
    MQTT_USERNAME,
)

logger = logging.getLogger(__name__)


class MQTTClient:
    """Thread-safe MQTT client wrapper."""

    def __init__(self, message_callback: Optional[Callable] = None):
        """
        Initialize MQTT client.

        Args:
            message_callback: Optional callback function that receives (topic, payload_dict)
        """
        self.client = mqtt.Client(client_id=MQTT_CLIENT_ID)
        self.message_callback = message_callback
        self.connected = False
        self._lock = threading.Lock()

        # Set up callbacks
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
        self.client.on_subscribe = self._on_subscribe

        # Set credentials if provided
        if MQTT_USERNAME and MQTT_PASSWORD:
            self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    def _on_connect(self, client, userdata, flags, rc):
        """Handle MQTT connection."""
        if rc == 0:
            self.connected = True
            logger.info(f"Connected to MQTT broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        else:
            self.connected = False
            logger.error(f"Failed to connect to MQTT broker. Return code: {rc}")

    def _on_disconnect(self, client, userdata, rc):
        """Handle MQTT disconnection."""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection. Return code: {rc}")
        else:
            logger.info("Disconnected from MQTT broker")

    def _on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages."""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode("utf-8"))
            logger.debug(f"Received MQTT message on {topic}: {payload}")

            # Call the message callback if provided
            if self.message_callback:
                self.message_callback(topic, payload)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode MQTT message: {e}")
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")

    def _on_subscribe(self, client, userdata, mid, granted_qos):
        """Handle subscription confirmation."""
        logger.info(f"Subscribed to topic. QoS: {granted_qos}")

    def connect(self) -> bool:
        """Connect to MQTT broker."""
        try:
            with self._lock:
                if not self.connected:
                    self.client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
                    self.client.loop_start()
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False

    def disconnect(self):
        """Disconnect from MQTT broker."""
        with self._lock:
            if self.connected:
                self.client.loop_stop()
                self.client.disconnect()
                self.connected = False
                logger.info("Disconnected from MQTT broker")

    def subscribe(self, topic: str, qos: int = 0) -> bool:
        """Subscribe to an MQTT topic."""
        try:
            result = self.client.subscribe(topic, qos)
            if result[0] == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Subscribed to topic: {topic}")
                return True
            else:
                logger.error(f"Failed to subscribe to topic: {topic}")
                return False
        except Exception as e:
            logger.error(f"Error subscribing to topic {topic}: {e}")
            return False

    def publish(self, topic: str, payload: dict, qos: int = 0) -> bool:
        """Publish a message to an MQTT topic."""
        try:
            payload_str = json.dumps(payload)
            result = self.client.publish(topic, payload_str, qos)
            if result[0] == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(f"Published to {topic}: {payload}")
                return True
            else:
                logger.error(f"Failed to publish to topic: {topic}")
                return False
        except Exception as e:
            logger.error(f"Error publishing to topic {topic}: {e}")
            return False

    def is_connected(self) -> bool:
        """Check if client is connected."""
        return self.connected

