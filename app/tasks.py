import time
from datetime import datetime, timedelta

from .database import SessionLocal
from . import crud, models


def monitor_heartbeats():
    """Periodically checks for offline devices."""
    while True:
        try:
            with SessionLocal() as db:
                devices = db.query(models.Device).all()
                for device in devices:
                    if device.last_heartbeat and (datetime.utcnow() - device.last_heartbeat) > timedelta(minutes=5):
                        device.status = "offline"
                db.commit()
            time.sleep(60)
        except Exception as e:
            print(f"Heartbeat monitoring error: {e}")
            time.sleep(60) # Continue even on error