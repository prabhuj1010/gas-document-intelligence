import psycopg

from app.config import get_settings


def connect(timeout_s: int = 3) -> psycopg.Connection:
    return psycopg.connect(**get_settings().db_conninfo(), connect_timeout=timeout_s)


def check_database() -> dict:
    """Readiness probe: can we connect, and is pgvector installed?"""
    try:
        with connect() as conn:
            row = conn.execute(
                "SELECT extversion FROM pg_extension WHERE extname = 'vector'"
            ).fetchone()
    except psycopg.Error as exc:
        # Report the error class only — never echo connection details or credentials
        return {"status": "unavailable", "error": type(exc).__name__}
    if row is None:
        return {"status": "degraded", "pgvector": None, "error": "pgvector extension not installed"}
    return {"status": "ok", "pgvector": row[0]}
