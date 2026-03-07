from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import DEVICE, MODEL_PATH
from ml.model import load_saved_model
from services.session_manager import SessionManager
from api.routes.health import router as health_router
from api.routes.sessions import router as sessions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.device = DEVICE
    app.state.session_manager = SessionManager()

    model = load_saved_model(MODEL_PATH)
    if model is not None:
        app.state.model = model
        print(f"Modelo carregado de: {MODEL_PATH}")
    else:
        app.state.model = None
        print(f"AVISO: modelo nao encontrado em {MODEL_PATH}. Coloque best_food_classifier.pth em models/")

    yield

    # Shutdown: stop all active sessions
    manager: SessionManager = app.state.session_manager
    for session_id in list(manager.sessions.keys()):
        manager.stop_session(session_id)


app = FastAPI(title="Food Package Classifier API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(sessions_router)
