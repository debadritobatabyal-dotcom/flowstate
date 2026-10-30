import os
from typing import List, Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = "flowstate-super-secret-development-key-32-chars-minimum"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 60
    REFRESH_TOKEN_DAYS: int = 7

    DATABASE_URL: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'storage', 'flowstate.db'))}"

    FRONTEND_ORIGIN: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000/api/v1"

    UPLOAD_DIR: str = "./storage/uploads"
    MAX_UPLOAD_MB: int = 25
    SEED_RANDOM: int = 42

    LLM_PROVIDER: Literal["auto", "gemini", "ollama", "none"] = "auto"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_MODEL_PATH: Optional[str] = None
    RAG_MIN_SCORE: float = 0.35
    RAG_TOP_K: int = 8

    TESSERACT_CMD: Optional[str] = None
    OCR_LANGS: str = "eng"

    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 1025
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "flowstate@example.test"

    ENABLE_SIMULATED_INTEGRATIONS: bool = True

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
