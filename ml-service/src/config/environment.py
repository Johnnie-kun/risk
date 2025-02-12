"""
Environment configuration module.
"""
import os
from dotenv import load_dotenv, find_dotenv
from loguru import logger

def load_environment():
    """Load environment variables from .env file."""
    env_path = find_dotenv()
    if not env_path:
        logger.warning("⚠️  .env file not found. Ensure environment variables are set.")
    else:
        load_dotenv(env_path)
        logger.info("✅ Environment variables loaded successfully.")

def get_required_env(key: str) -> str:
    """
    Get a required environment variable.
    Raises ValueError if the variable is not set.
    """
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Required environment variable {key} is not set")
    return value

def get_optional_env(key: str, default: str) -> str:
    """Get an optional environment variable with a default value."""
    return os.getenv(key, default)

# Model related environment variables
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/saved/lstm_model")
MODEL_VERSION = get_optional_env("MODEL_VERSION", "v1.0.0")

# Service configuration
ML_SERVICE_HOST = get_optional_env("ML_SERVICE_HOST", "0.0.0.0")
ML_SERVICE_PORT = int(get_optional_env("ML_SERVICE_PORT", "8001"))
ML_SERVICE_RELOAD = get_optional_env("ML_SERVICE_RELOAD", "true").lower() == "true"

# API configuration
CORS_ALLOWED_ORIGINS = get_optional_env("CORS_ALLOWED_ORIGINS", "http://localhost,http://127.0.0.1").split(",")

# JWT configuration
JWT_SECRET_KEY = None  # Will be set when load_environment is called
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30 