from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings come from the environment, then ../.env (repo root), then backend/.env."""

    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    postgres_user: str = "gas"
    postgres_password: str = ""
    postgres_db: str = "gas"
    postgres_host: str = "127.0.0.1"
    postgres_port: int = 5433

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    storage_dir: str = "../storage"
    ollama_base_url: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip() and o.strip() != "*"]

    def db_conninfo(self) -> dict:
        return {
            "user": self.postgres_user,
            "password": self.postgres_password,
            "dbname": self.postgres_db,
            "host": self.postgres_host,
            "port": self.postgres_port,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
