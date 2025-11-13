from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from .. import crud, models, schemas, security
from ..config import settings
from ..database import get_db
from ..mqtt_client import send_relay_command

router = APIRouter(
    tags=["Devices & Sockets"],
    dependencies=[Depends(security.get_current_user)]
)


@router.post("/devices/register", response_model=schemas.Device)
def register_device(
        device: schemas.DeviceRegister,
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Register a new device to the current user.
    This will also auto-create the 4 socket entries for this device.
    """
    db_device = crud.get_device_by_id(db, device.id)
    if db_device:
        raise HTTPException(status_code=400, detail="Device ID already registered")

    # This CRUD function must be updated to create the 4 sockets
    return crud.register_device(db=db, device=device, user_id=current_user.id)


@router.get("/devices/", response_model=List[schemas.Device])
def get_user_devices(
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get a list of all devices registered to the current user.
    """
    return crud.get_user_devices(db=db, user_id=current_user.id)


@router.get("/sockets/{device_id}", response_model=List[schemas.Socket])
def get_device_sockets(
        device_id: str,
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get the 4 socket entries for a specific device.
    """
    device = crud.get_device_by_id(db, device_id)
    if not device or device.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Device not found")

    # This CRUD function will now just return the 4 sockets
    return crud.get_device_sockets(db=db, device_id=device_id)


@router.post("/sockets/control")
def control_socket(
        control: schemas.SocketControl,
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Turn a socket on or off using its device_id and socket_index (1-4).
    """
    # This CRUD function must be created
    socket = crud.get_socket_by_device_and_index(
        db,
        device_id=control.device_id,
        socket_index=control.socket_index
    )

    if not socket:
        raise HTTPException(status_code=404, detail="Socket not found")

    # Check ownership via the device
    if socket.device.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check cooling period
    if (control.status == "on" and
            socket.last_shutdown and
            (datetime.utcnow() - socket.last_shutdown) < timedelta(minutes=settings.COOLING_PERIOD_MINUTES)):
        raise HTTPException(status_code=400, detail="Cooling period active, socket cannot be turned on yet.")

    # Send the command to the device
    send_relay_command(
        device_id=control.device_id,
        socket_index=control.socket_index,
        status=control.status
    )

    # This CRUD function must be updated
    crud.update_socket_status(db, socket, control.status)
    return {"message": "Command sent"}
