import logging
import queue
import threading
import time
from datetime import datetime
from typing import Optional
from uuid import UUID

import boto3
from botocore.exceptions import ClientError

from config import S3_BUCKET, S3_ENABLED, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
from services.detection_writer import update_s3_key


logger = logging.getLogger(__name__)

_upload_queue: queue.Queue = queue.Queue()
_worker_thread: Optional[threading.Thread] = None


def _s3_client():
    kwargs: dict = {"region_name": S3_REGION}
    if S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = S3_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = S3_SECRET_ACCESS_KEY
    return boto3.client("s3", **kwargs)


_CATEGORY_FOLDER = {
    "arroz": "rice",
    "feijao": "beans",
    "outros": "others",
}


def _upload_worker():
    while True:
        item = _upload_queue.get()
        if item is None:
            break

        detection_id: UUID = item["detection_id"]
        category: str = item["category"]
        frame_bytes: bytes = item["frame_bytes"]

        folder = _CATEGORY_FOLDER.get(category, "others")
        key = f"{folder}/{detection_id}.jpg"

        for attempt in range(1, 4):
            try:
                client = _s3_client()
                client.put_object(
                    Bucket=S3_BUCKET,
                    Key=key,
                    Body=frame_bytes,
                    ContentType="image/jpeg",
                )
                update_s3_key(detection_id, key)
                logger.info("[S3] Uploaded %s", key)
                break
            except ClientError as exc:
                logger.warning("[S3] Upload attempt %d failed: %s", attempt, exc)
                if attempt < 3:
                    time.sleep(2 ** attempt)
                else:
                    logger.error("[S3] All retries exhausted for %s", detection_id)

        _upload_queue.task_done()


def start_worker():
    global _worker_thread
    if not S3_ENABLED:
        return
    _worker_thread = threading.Thread(target=_upload_worker, daemon=True, name="s3-uploader")
    _worker_thread.start()


def stop_worker():
    if _worker_thread and _worker_thread.is_alive():
        _upload_queue.put(None)
        _worker_thread.join(timeout=5)


def enqueue_upload(
    detection_id: UUID,
    category: str,
    frame_bytes: bytes,
):
    if not S3_ENABLED:
        return
    _upload_queue.put(
        {
            "detection_id": detection_id,
            "category": category,
            "frame_bytes": frame_bytes,
        }
    )
