from fastapi import APIRouter, Request

from api.schemas import HealthResponse

router = APIRouter()


@router.get("/api/health", response_model=HealthResponse)
def health(request: Request):
    model_loaded = getattr(request.app.state, "model", None) is not None
    return HealthResponse(status="ok", model_loaded=model_loaded)
