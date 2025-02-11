from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv, find_dotenv
import uvicorn
import os
from loguru import logger

from auth import auth_router, get_current_active_user
from routes.predictions import router as predictions_router

# Load environment variables early
if not find_dotenv():
    logger.warning("⚠️  .env file not found. Ensure environment variables are set.")
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Bitcoin Price Prediction ML Service",
    description="A machine learning service for predicting Bitcoin prices.",
    version="1.0.0",
)

# Configure logging with Loguru
logger.add("logs/ml_service.log", rotation="10MB", level="INFO")
logger.info("📝 Logging initialized.")

# Configure CORS
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
# Protect prediction routes with authentication
app.include_router(
    predictions_router,
    prefix="/predictions",
    dependencies=[Depends(get_current_active_user)]
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP exception: {exc}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'code': exc.status_code,
            'name': exc.__class__.__name__,
            'description': exc.detail
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc)
        }
    )

# Graceful shutdown handling
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 ML Service is starting...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 ML Service is shutting down...")

# Run the FastAPI app
if __name__ == "__main__":
    host = os.getenv("ML_SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("ML_SERVICE_PORT", "8001"))
    reload = os.getenv("ML_SERVICE_RELOAD", "true").lower() == "true"

    logger.info(f"🚀 Starting ML Service at {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
    )
