import queue
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Optional

from config import CATEGORIES
from api.schemas import SessionResult, DetectionRecord
from services.webcam_service import WebcamService


@dataclass
class Session:
    session_id: str
    start_time: float
    stop_event: threading.Event
    result_queue: queue.Queue
    thread: threading.Thread
    webcam_service: WebcamService
    status: str = "running"
    final_result: Optional[SessionResult] = None


class SessionManager:
    def __init__(self):
        self.sessions: dict[str, Session] = {}
        self.lock = threading.Lock()

    def create_session(self, model) -> Session:
        session_id = str(uuid.uuid4())
        stop_event = threading.Event()
        result_queue: queue.Queue = queue.Queue()

        svc = WebcamService(
            model=model,
            stop_event=stop_event,
            result_queue=result_queue,
        )

        thread = threading.Thread(target=svc.run, daemon=True)

        session = Session(
            session_id=session_id,
            start_time=time.time(),
            stop_event=stop_event,
            result_queue=result_queue,
            thread=thread,
            webcam_service=svc,
        )

        with self.lock:
            self.sessions[session_id] = session

        thread.start()
        return session

    def get_session(self, session_id: str) -> Optional[Session]:
        with self.lock:
            return self.sessions.get(session_id)

    def stop_session(self, session_id: str) -> Optional[SessionResult]:
        session = self.get_session(session_id)
        if session is None:
            return None

        session.stop_event.set()
        session.thread.join(timeout=10)

        svc = session.webcam_service
        elapsed = time.time() - session.start_time

        result = SessionResult(
            session_id=session_id,
            counts=dict(svc.counts),
            sub_items=dict(svc.sub_item_counts),
            detections=[
                DetectionRecord(
                    label=d["label"],
                    sub_item=d.get("sub_item", "desconhecido"),
                    confidence=d["confidence"],
                    timestamp=d["timestamp"],
                    object_id=d.get("object_id"),
                )
                for d in svc.detections
            ],
            elapsed_seconds=elapsed,
            total_unique_items=svc.counts.get("total", 0),
        )

        session.status = "stopped"
        session.final_result = result

        with self.lock:
            self.sessions.pop(session_id, None)

        return result
