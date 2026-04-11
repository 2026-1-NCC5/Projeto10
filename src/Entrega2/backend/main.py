import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models.team
import models.ai_detection
from database import engine, Base
from api.routes.auth import router as auth_router
from api.routes.users import router as users_router
from api.routes.health import router as health_router
from api.routes.teams import router as teams_router
from api.routes.collections import router as collections_router
from api.routes.ai_detections import router as ai_detections_router
from api.routes.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Liderancas Empaticas Auth API", lifespan=lifespan)

cors_origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(health_router)
app.include_router(teams_router)
app.include_router(collections_router)
app.include_router(ai_detections_router)
app.include_router(dashboard_router)
