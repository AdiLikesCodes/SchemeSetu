"""
Application configuration settings.
"""

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Export .env into os.environ so third-party libraries can read it
load_dotenv()


class Settings(BaseSettings):
    """
    Settings for the FastAPI application.
    Loads from environment variables or .env file.
    """
    PROJECT_NAME: str = "SchemeSetu API"
    MONGODB_URI: str
    GEMINI_API_KEY: str
    # Firecrawl API key — optional; pipeline falls back to httpx if empty
    FIRECRAWL_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
