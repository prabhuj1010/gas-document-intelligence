from fastapi import APIRouter, Response
from pydantic import BaseModel

from app.config import get_settings
from app.db import check_database

router = APIRouter()


class HealthResponse(BaseModel):
    status: str  # "ok" | "degraded"
    services: dict[str, dict]

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "services": {
                    "api": {"status": "ok"},
                    "database": {"status": "ok", "pgvector": "0.8.0"},
                    "ollama": {"status": "not_configured"},
                },
            }
        }
    }


@router.get(
    "/api/health",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse, "description": "A required dependency is unavailable"}},
    tags=["health"],
)
def health(response: Response) -> HealthResponse:
    database = check_database()
    # Ollama is wired in on Day 4; until then only report whether it is configured.
    ollama = {"status": "configured" if get_settings().ollama_base_url else "not_configured"}

    ok = database["status"] == "ok"
    if not ok:
        response.status_code = 503
    return HealthResponse(
        status="ok" if ok else "degraded",
        services={"api": {"status": "ok"}, "database": database, "ollama": ollama},
    )
