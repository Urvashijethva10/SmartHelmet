import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Smart Helmet Detection System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://smarthelmet-frontend.onrender.com",
]

    # MongoDB Atlas Settings
    MONGODB_URI: str = ""
    DATABASE_NAME: str = "smart_helmet_db"
    DETECTIONS_COLLECTION: str = "detections"

    # YOLO Model Settings
    # Resolved relative to project root / backend directory
    MODEL_PATH: str = str(Path(__file__).resolve().parent.parent.parent.parent / "best.pt")
    CONFIDENCE_THRESHOLD: float = 0.30
    IOU_THRESHOLD: float = 0.45

    # Class mappings as specified:
    # 0 = Helmet, 1 = No-Helmet, 2 = No-Vest, 3 = Person, 4 = Vest
    CLASS_MAPPING: dict[int, str] = {
        0: "Helmet",
        1: "No-Helmet",
        2: "No-Vest",
        3: "Person",
        4: "Vest"
    }

    # Bounding Box Color Mapping (BGR format for OpenCV)
    # Green: Compliant (Helmet, Vest)
    # Red: Non-Compliant (No-Helmet, No-Vest)
    # Cyan/Blue: Person
    CLASS_COLORS: dict[int, tuple[int, int, int]] = {
        0: (34, 197, 94),    # Helmet -> Emerald Green (BGR: 94, 197, 34 -> (0, 200, 0))
        1: (0, 0, 230),      # No-Helmet -> Bright Red (BGR: 0, 0, 230)
        2: (0, 100, 245),    # No-Vest -> Amber-Red (BGR: 0, 100, 245)
        3: (235, 160, 40),   # Person -> Cyan / Sky Blue (BGR: 235, 160, 40)
        4: (0, 210, 100)     # Vest -> Vibrant Green (BGR: 0, 210, 100)
    }

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
