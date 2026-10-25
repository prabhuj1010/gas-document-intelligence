from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health
from app.config import get_settings

app = FastAPI(
    title="GAS Document Intelligence API",
    version="0.1.0",
    description="Local-first PDF document intelligence MVP. No external AI services are called.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,  # explicit list, never "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"],
)

app.include_router(health.router)
