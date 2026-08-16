import math
import logging
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.db.mongodb import db_manager
from app.models.detection import DashboardStats, PaginatedHistoryResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics & History"])


@router.get("/dashboard/stats", response_model=DashboardStats, summary="Retrieve aggregate dashboard statistics")
async def get_dashboard_stats():
    """
    Returns aggregated metrics:
    - Total inspections count
    - Total workers detected
    - Total safety violations
    - Helmet & Vest compliance rates
    - Class counts breakdown
    - Status distribution
    - Recent detection feed
    """
    try:
        stats = db_manager.get_dashboard_stats()
        return DashboardStats(**stats)
    except Exception as e:
        logger.exception("Failed to compute dashboard stats: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard statistics: {str(e)}",
        )


@router.get("/history", response_model=PaginatedHistoryResponse, summary="Retrieve paginated detection history")
async def get_detection_history(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(default="ALL", description="Filter by status: ALL | COMPLIANT | VIOLATION | WARNING"),
):
    """
    Returns paginated list of detection logs with timestamp, counts, violation notes, and compliance metrics.
    """
    try:
        items, total = db_manager.get_history(page=page, limit=limit, status=status)
        total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1

        return PaginatedHistoryResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.exception("Failed to retrieve detection history: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history logs: {str(e)}",
        )
