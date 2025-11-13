# app/ws_manager.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Go through a copy of the list in case it changes
        for connection in self.active_connections[:]:
            try:
                await connection.send_json(message)
            except Exception:
                # Handle potential errors, e.g., client disconnected abruptly
                self.active_connections.remove(connection)

# The single, shared instance that other files will import
manager = ConnectionManager()
