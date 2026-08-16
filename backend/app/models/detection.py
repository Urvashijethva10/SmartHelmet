from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    class_id: int
    class_name: str
    confidence: float


class DetectionSummary(BaseModel):
    worker_count: int = Field(default=0, description="Total persons detected")
    helmet_count: int = Field(default=0, description="Workers wearing helmets")
    no_helmet_count: int = Field(default=0, description="Workers missing helmets")
    vest_count: int = Field(default=0, description="Workers wearing safety vests")
    no_vest_count: int = Field(default=0, description="Workers missing safety vests")
    total_violations: int = Field(default=0, description="Sum of no-helmet and no-vest detections")
    helmet_compliance_rate: float = Field(default=100.0, description="Helmet compliance percentage")
    vest_compliance_rate: float = Field(default=100.0, description="Vest compliance percentage")
    overall_compliance_rate: float = Field(default=100.0, description="Overall PPE compliance percentage")
    safety_status: str = Field(default="COMPLIANT", description="COMPLIANT | VIOLATION | WARNING | NO_WORKERS")
    violations: List[str] = Field(default_factory=list, description="List of text descriptions for violations")


class DetectionRecord(BaseModel):
    id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    filename: str = "image.jpg"
    image_width: int
    image_height: int
    summary: DetectionSummary
    detections: List[BoundingBox] = Field(default_factory=list)
    inference_time_ms: float = 0.0


class DetectionResponse(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    filename: str
    image_width: int
    image_height: int
    summary: DetectionSummary
    detections: List[BoundingBox]
    annotated_image_base64: str
    inference_time_ms: float


class DashboardStats(BaseModel):
    total_inspections: int = 0
    total_workers: int = 0
    total_violations: int = 0
    helmet_compliance_rate: float = 100.0
    vest_compliance_rate: float = 100.0
    overall_compliance_rate: float = 100.0
    class_counts: Dict[str, int] = Field(
        default_factory=lambda: {
            "Helmet": 0,
            "No-Helmet": 0,
            "No-Vest": 0,
            "Person": 0,
            "Vest": 0,
        }
    )
    status_breakdown: Dict[str, int] = Field(
        default_factory=lambda: {
            "COMPLIANT": 0,
            "VIOLATION": 0,
            "WARNING": 0,
            "NO_WORKERS": 0,
        }
    )
    recent_detections: List[Dict[str, Any]] = Field(default_factory=list)


class PaginatedHistoryResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int
    page: int
    limit: int
    total_pages: int


class HealthStatus(BaseModel):
    status: str
    version: str
    model_loaded: bool
    database_connected: bool
    database_name: str
    active_classes: Dict[int, str]
