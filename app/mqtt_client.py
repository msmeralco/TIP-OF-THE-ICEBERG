import paho.mqtt.client as mqtt
import json
import asyncio
from threading import Thread
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from pydantic import ValidationError

from . import crud, models, schemas, services
from .database import SessionLocal
from .config import settings
from .ws_manager import manager

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)


def send_relay_command(device_id: str, socket_index: int, status: str):
    """
    Sends a command to the device to control a specific socket by its index (1-4).
    """
    topic = f"alisto/control/{device_id}"
    payload = json.dumps({"socket_index": socket_index, "status": status})
    print(f"Publishing to {topic}: {payload}")
    mqtt_client.publish(topic, payload)


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker")
        # Subscribe to the data topic for all devices
        client.subscribe("alisto/devices/data/#")
    else:
        print(f"Failed to connect to MQTT, return code {rc}")


def on_message(client, userdata, msg):
    """
    Handles incoming data packets from all devices.
    """
    # Get the asyncio loop we passed in via userdata
    loop = userdata

    try:
        topic = msg.topic
        if not topic.startswith("alisto/devices/data/"):
            return

        device_id = topic.split('/')[-1]

        # 1. Validate the incoming payload
        try:
            data = schemas.DeviceDataPayload.model_validate_json(msg.payload)
        except (json.JSONDecodeError, ValidationError) as e:
            print(f"Invalid payload from {device_id} on topic {topic}: {e}")
            return

        with SessionLocal() as db:
            device = crud.get_device_by_id(db, device_id)
            if not device:
                print(f"Received message from unknown device: {device_id}")
                return

            # 2. Update device heartbeat
            crud.update_device_heartbeat(db, device, "online")

            # 3. Create the single, unified log entry
            log_entry = crud.create_device_log(db, device_id, data)

            # 4. Check for fire alerts based on device-level sensors
            if (data.smoke > settings.SMOKE_THRESHOLD_FIRE or
                    data.ambient_temperature > settings.TEMP_THRESHOLD_FIRE):

                severity = "critical" if data.smoke > settings.SMOKE_THRESHOLD_CRITICAL else "fire"

                # Create the alert
                crud.create_fire_alert(db, device_id, severity, data.model_dump())

                # Send push notification
                # TODO: Get actual user device token from device.owner
                services.send_push_notification("user_device_token", f"Fire alert on {device.id}: {severity}")

                if severity == "critical":
                    services.notify_bfp({"device_id": device_id, "severity": severity})

            # 5. Broadcast the new log to all connected WebSocket clients
            broadcast_data = {
                "type": "log_update",
                # Use the schema to convert the DB model to a dict
                "data": schemas.DeviceLog.model_validate(log_entry).model_dump()
            }
            asyncio.run_coroutine_threadsafe(manager.broadcast(broadcast_data), loop)

    except Exception as e:
        print(f"Error in on_message: {e}")


def start_mqtt(loop: asyncio.AbstractEventLoop):
    """
    Starts the MQTT client loop in a thread.
    Requires the main asyncio loop to safely broadcast to websockets.
    """
    try:
        # Pass the asyncio loop to on_message via userdata
        mqtt_client.user_data_set(loop)

        if settings.MQTT_USER and settings.MQTT_PASS:
            mqtt_client.username_pw_set(settings.MQTT_USER, settings.MQTT_PASS)

        # Only use TLS if we are not on the standard, non-secure port
        if settings.MQTT_PORT != 1883:
            mqtt_client.tls_set()

        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message

        print(f"Attempting to connect to MQTT at {settings.MQTT_BROKER}:{settings.MQTT_PORT}")
        mqtt_client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        mqtt_client.loop_forever()
    except Exception as e:
        print(f"MQTT thread error: {e}")
