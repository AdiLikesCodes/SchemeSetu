"""
Application configuration using pydantic-settings.
All values are loaded from environment variables or .env file without hardcoding.
"""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    APP_NAME: str = "SchemeSetu"
    PROJECT_NAME: str = "SchemeSetu API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database — PyMongo Async
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string",
    )
    MONGODB_DB_NAME: str = "schemesetu"
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 2000

    # AI / LLM — env configurable, never hardcoded
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google AI Studio API key for Gemini",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-3.5-flash-lite",
        description="Gemini model identifier",
    )
    GEMINI_TEMPERATURE: float = Field(
        default=0.2,
        description="Temperature for generative responses",
    )

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Google Cloud & Cloud DLP (Tier 2 defense-in-depth)
    GOOGLE_CLOUD_PROJECT: str = Field(
        default="",
        description="GCP project ID for Cloud DLP / Speech",
    )
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(
        default="",
        description="Path to GCP Service Account JSON keyfile",
    )
    DLP_ENABLED: bool = Field(
        default=False,
        description="Enable Cloud DLP second-pass sanitizer",
    )
    DLP_INTEGRATION_TESTS: bool = Field(
        default=False,
        description="Run real DLP integration tests with ADC",
    )
    DLP_TIMEOUT_SECONDS: float = Field(
        default=2.0,
        description="DLP API timeout in seconds",
    )

    # Rate Limiting
    RATE_LIMIT_CHAT_PER_SESSION: int = Field(
        default=60,
        description="Max chat requests per session per hour",
    )
    RATE_LIMIT_UPLOAD_PER_SESSION: int = Field(
        default=10,
        description="Max document uploads per session per hour",
    )

    # OCR Configuration
    OCR_CONFIRMATION_EXPIRY_MINUTES: int = Field(
        default=10,
        description="Minutes before a pending OCR confirmation token expires",
    )

    # Admin Seeding & Security
    ENABLE_ADMIN_SEED_ENDPOINT: bool = Field(
        default=False,
        description="Allow invoking /api/v1/admin/seed with X-Admin-Key",
    )
    ADMIN_API_KEY: str = Field(
        default="",
        description="Shared secret required if ENABLE_ADMIN_SEED_ENDPOINT is True",
    )
    JWT_SECRET_KEY: str = Field(
        default="schemesetu-insecure-secret-key-change-in-production",
        description="JWT signing secret key",
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm",
    )
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=1440,
        description="JWT access token expiry in minutes (default 24 hours)",
    )

    # Scraper Configuration
    FIRECRAWL_API_KEY: str = Field(
        default="",
        description="Firecrawl API key (optional; falls back to httpx if empty)",
    )

    # Channels: Meta WhatsApp Cloud API
    WHATSAPP_PHONE_NUMBER_ID: str = Field(
        default="",
        description="Meta WhatsApp Cloud API Phone Number ID",
    )
    WHATSAPP_ACCESS_TOKEN: str = Field(
        default="",
        description="Meta WhatsApp Cloud API System User Access Token",
    )
    WHATSAPP_APP_SECRET: str = Field(
        default="",
        description="Meta App Secret for HMAC webhook signature verification",
    )
    WHATSAPP_VERIFY_TOKEN: str = Field(
        default="",
        description="Verification token for Meta Webhook subscription handshake",
    )
    WHATSAPP_API_VERSION: str = Field(
        default="v19.0",
        description="Meta Graph API version",
    )

    # Voice (STT & TTS)
    SPEECH_TO_TEXT_LANGUAGE: str = Field(
        default="en-IN",
        description="Default language code for Speech-to-Text",
    )
    TEXT_TO_SPEECH_LANGUAGE: str = Field(
        default="en-IN",
        description="Default language code for Text-to-Speech",
    )
    GOOGLE_SPEECH_API_KEY: str = Field(
        default="",
        description="Optional API key for Google Cloud Speech services",
    )


settings = Settings()
