import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import db_manager
from app.services.yolo_service import yolo_service
from app.routers import detection, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("smart_helmet")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect DB and preload YOLO11 model
    logger.info("Initializing Smart Helmet Detection System...")
    db_manager.connect()
    yolo_service.load_model()
    yield
    # Shutdown: close DB connection pool
    logger.info("Shutting down Smart Helmet Detection System...")
    db_manager.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Industrial Worker PPE Safety Monitoring & YOLO11 Detection System",
    lifespan=lifespan,
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(detection.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/", tags=["Root"])
def root_status():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
