import pytest
from fastapi.testclient import TestClient

from app import db
from app.api import health as health_module
from app.main import app

client = TestClient(app)


def test_health_ok_when_database_ready(monkeypatch):
    monkeypatch.setattr(health_module, "check_database", lambda: {"status": "ok", "pgvector": "0.8.0"})
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["services"]["database"]["pgvector"] == "0.8.0"


def test_health_503_when_database_down(monkeypatch):
    monkeypatch.setattr(
        health_module, "check_database", lambda: {"status": "unavailable", "error": "OperationalError"}
    )
    r = client.get("/api/health")
    assert r.status_code == 503
    assert r.json()["status"] == "degraded"


def test_cors_rejects_unknown_origin():
    r = client.options(
        "/api/health",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in r.headers


@pytest.mark.integration
def test_live_database_has_pgvector():
    """Needs `docker compose up -d`. Run with: pytest -m integration"""
    result = db.check_database()
    assert result["status"] == "ok", result
