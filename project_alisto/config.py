"""Configuration for Project Alisto MQTT and thermal settings."""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MQTT Broker Configuration
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", None)
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", None)
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", "alisto-app")

# MQTT Topic Patterns
MQTT_TOPIC_SOCKET_DATA = "alisto/socket/{socket_id}/data"
MQTT_TOPIC_SOCKET_STATUS = "alisto/socket/{socket_id}/status"
MQTT_TOPIC_SOCKET_CONTROL = "alisto/socket/{socket_id}/control"

# Thermal Limits (for UI display/reference only)
DEFAULT_MAX_TEMPERATURE = 60.0  # Celsius
DEFAULT_MAX_CURRENT = 15.0  # Amperes

# Cooling Period (for UI countdown display)
COOLING_PERIOD_MINUTES = 5

# Number of sockets
NUM_SOCKETS = 4

