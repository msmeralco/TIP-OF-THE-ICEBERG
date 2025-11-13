# app/routers/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..ws_manager import manager  # Import the manager from our new file

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from the client (if any)
            data = await websocket.receive_text()
            # You could add logic here, e.g.:
            # print(f"Client sent: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("A client disconnected.")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
