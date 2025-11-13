from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from .. import crud, models, schemas, security
from ..database import get_db

router = APIRouter(
    tags=["Reports"],
    dependencies=[Depends(security.get_current_user)]
)


@router.get("/alerts/", response_model=List[schemas.FireAlert])
def get_alerts(
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get all fire alerts for the current user.
    """
    return crud.get_user_alerts(db, user_id=current_user.id)


@router.get("/consumption/report/{device_id}", response_model=schemas.DeviceConsumptionReport)
def get_consumption_report(
        device_id: str,
        period: str = "daily",
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get a consumption report for a specific device, showing totals
    for all 4 of its sockets.
    """
    # Check if device exists and belongs to the user
    device = crud.get_device_by_id(db, device_id)
    if not device or device.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Device not found")

    now = datetime.utcnow()
    if period == "daily":
        start = now - timedelta(days=1)
    elif period == "weekly":
        start = now - timedelta(weeks=1)
    elif period == "monthly":
        start = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period. Use 'daily', 'weekly', or 'monthly'.")

    # This CRUD function will need to be created to query DeviceLog
    return crud.get_device_consumption(db, device, start, now)


@router.get("/bill/estimate", response_model=schemas.BillEstimate)
def get_bill_estimate(
        current_user: models.User = Depends(security.get_current_user),
        db: Session = Depends(get_db)
):
    """
    Get an estimated monthly bill for the user based on the
    last 30 days of consumption from all devices.
    """
    # This endpoint definition is still valid.
    # The logic inside crud.get_user_bill_estimate will change,
    # but this router doesn't need to know about that.
    start = datetime.utcnow() - timedelta(days=30)
    return crud.get_user_bill_estimate(db, current_user, start)
