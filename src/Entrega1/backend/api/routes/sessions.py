import asyncio
import queue
import time

from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse

from api.schemas import SessionStatus, SessionResult

router = APIRouter()


def _get_manager(request: Request):
    return request.app.state.session_manager


def _get_model(request: Request):
    return getattr(request.app.state, "model", None)


@router.post("/api/sessions", response_model=SessionStatus)
def create_session(request: Request):
    model = _get_model(request)
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo nao carregado. Coloque best.pt em models/",
        )

    manager = _get_manager(request)
    session = manager.create_session(model=model)

    return SessionStatus(
        session_id=session.session_id,
        status="running",
        counts=session.webcam_service.counts,
        active_detections=[],
        tracked_objects=0,
        elapsed_seconds=0.0,
    )


@router.get("/api/sessions/{session_id}", response_model=SessionStatus)
def get_session(session_id: str, request: Request):
    manager = _get_manager(request)
    session = manager.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")

    svc = session.webcam_service
    status = "stopped" if session.stop_event.is_set() else "running"

    return SessionStatus(
        session_id=session_id,
        status=status,
        counts=dict(svc.counts),
        active_detections=[],
        tracked_objects=0,
        elapsed_seconds=time.time() - session.start_time,
    )


@router.delete("/api/sessions/{session_id}", response_model=SessionResult)
def stop_session(session_id: str, request: Request):
    manager = _get_manager(request)
    result = manager.stop_session(session_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")
    return result


@router.get("/api/sessions/{session_id}/stream")
async def stream_session(session_id: str, request: Request):
    """MJPEG stream do feed da camera com detecções desenhadas.

    Uso no frontend:
        <img src="http://localhost:8000/api/sessions/{id}/stream" />
    """
    manager = _get_manager(request)
    session = manager.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")

    async def mjpeg_generator():
        while not session.stop_event.is_set():
            jpeg = session.webcam_service.get_jpeg_frame()
            if jpeg is not None:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + jpeg
                    + b"\r\n"
                )
            await asyncio.sleep(0.05)  # ~20 fps max

    return StreamingResponse(
        mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.websocket("/ws/sessions/{session_id}")
async def websocket_session(websocket: WebSocket, session_id: str):
    manager = websocket.app.state.session_manager
    session = manager.get_session(session_id)

    if session is None:
        await websocket.close(code=4004)
        return

    await websocket.accept()

    try:
        while True:
            try:
                msg = session.result_queue.get_nowait()
            except queue.Empty:
                if session.stop_event.is_set():
                    await websocket.send_json({
                        "type": "stopped",
                        "results": {
                            "counts": dict(session.webcam_service.counts),
                            "detections": list(session.webcam_service.detections),
                        },
                    })
                    break
                await asyncio.sleep(0.1)
                continue

            if msg["type"] == "update":
                await websocket.send_json(msg)
            elif msg["type"] == "stopped":
                await websocket.send_json(msg)
                break
    except WebSocketDisconnect:
        pass
