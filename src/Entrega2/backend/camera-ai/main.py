import os
import signal
import sys
import threading
from typing import Optional
from uuid import UUID


os.environ.setdefault("QT_QPA_PLATFORM", "xcb")
os.environ.setdefault("QT_LOGGING_RULES", "*.debug=false;qt.qpa.*=false;qt.text.*=false")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL, CAMERA_INDEX
from ml.model import load_model
from services.capture_service import run_capture_loop
from services.detection_writer import write_detection
from services.s3_uploader import enqueue_upload, start_worker, stop_worker


def _get_db_session():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    return Session()


def _select_team() -> tuple[UUID, str]:
    db = _get_db_session()
    try:
        rows = db.execute(
            text("SELECT id, name FROM teams ORDER BY name")
        ).fetchall()
    finally:
        db.close()

    if not rows:
        print("[ERRO] Nenhuma equipe cadastrada no sistema.")
        sys.exit(1)

    print("\n=== Selecione a equipe ===")
    for idx, row in enumerate(rows, start=1):
        print(f"  {idx}. {row.name}")

    while True:
        raw = input("\nNumero da equipe: ").strip()
        if raw.isdigit():
            choice = int(raw)
            if 1 <= choice <= len(rows):
                selected = rows[choice - 1]
                return selected.id, selected.name
        print(f"Entrada invalida. Digite um numero entre 1 e {len(rows)}.")


def _prompt_operator() -> Optional[str]:
    name = input("Nome do operador (opcional, Enter para pular): ").strip()
    return name if name else None


def _prompt_camera_index() -> int:
    raw = input(f"Indice da camera [default {CAMERA_INDEX}]: ").strip()
    if raw.isdigit():
        return int(raw)
    return CAMERA_INDEX


def main():
    print("=== Camera AI — Liderancas Empaticas ===\n")

    team_id, team_name = _select_team()
    print(f"\nEquipe selecionada: {team_name}")

    operator_name = _prompt_operator()
    camera_index = _prompt_camera_index()

    print("\nCarregando modelo YOLO...")
    model = load_model()
    if model is None:
        print("[ERRO] Modelo nao encontrado. Verifique o caminho em MODEL_PATH.")
        sys.exit(1)
    print("[OK] Modelo carregado.\n")

    start_worker()

    stop_event = threading.Event()

    def _handle_sigint(sig, frame):
        print("\n[INFO] Encerrando...")
        stop_event.set()

    signal.signal(signal.SIGINT, _handle_sigint)

    def on_detection(record: dict, frame_bytes: bytes):
        detection_id = write_detection(
            item_name=record["item_name"],
            category=record["category"],
            confidence=record["confidence"],
            team_id=record["team_id"],
            operator_name=record["operator_name"],
            estimated_weight_g=record.get("estimated_weight_g"),
            estimated_price_brl=record.get("estimated_price_brl"),
        )
        enqueue_upload(
            detection_id=detection_id,
            category=record["category"],
            frame_bytes=frame_bytes,
        )

    run_capture_loop(
        model=model,
        team_id=team_id,
        operator_name=operator_name,
        on_detection=on_detection,
        stop_event=stop_event,
        camera_index=camera_index,
    )

    stop_worker()


if __name__ == "__main__":
    main()
