# app/main.py

from fastapi import FastAPI
from threading import Thread
import asyncio

from . import models
from .database import engine, Base
# Import all routers from the 'routers' package
from .routers import users, devices, reports, ws
from .mqtt_client import start_mqtt
from .tasks import monitor_heartbeats

# Create all database tables on startup
# We must import models before this line so Base knows about them
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alisto Smart System API",
    description="Backend for the Alisto smart power socket and fire prevention system.",
    version="1.0.0"
)

# Include API routers
app.include_router(users.router)
app.include_router(devices.router)
app.include_router(reports.router)

app.include_router(ws.router)


@app.on_event("startup")
def on_startup():
    # Get the asyncio event loop for the main thread
    loop = asyncio.get_event_loop()  # <-- GET THE LOOP

    # Start MQTT client in a background thread
    mqtt_thread = Thread(target=start_mqtt, args=(loop,), daemon=True)  # <-- PASS THE LOOP
    mqtt_thread.start()

    # Start heartbeat monitor in a background thread
    heartbeat_thread = Thread(target=monitor_heartbeats, daemon=True)
    heartbeat_thread.start()


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Alisto API"}


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)