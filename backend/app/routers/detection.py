import logging
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status

from app.services.yolo_service import yolo_service
from app.db.mongodb import db_manager
from app.models.detection import DetectionResponse, HealthStatus
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Detection"])


@router.post(
    "/detect",
    response_model=DetectionResponse,
    summary="Upload image and run YOLO PPE safety detection",
)
async def detect_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP)"),
    confidence: float = Query(
        default=settings.CONFIDENCE_THRESHOLD,
        ge=0.1,
        le=1.0,
        description="Confidence threshold for YOLO detection",
    ),
):
    logger.info("DETECT: request received")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Please upload an image file.",
        )

    try:
        # -----------------------------
        # Read uploaded image
        # -----------------------------
        image_bytes = await file.read()

        logger.info(
            "DETECT: image received: filename=%s size=%d bytes",
            file.filename,
            len(image_bytes),
        )

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        # -----------------------------
        # YOLO inference
        # -----------------------------
        logger.info("DETECT: starting YOLO prediction")

        summary, detections, annotated_base64, inference_time_ms, w, h = (
            yolo_service.predict(
                image_bytes=image_bytes,
                filename=file.filename or "image.jpg",
                confidence_threshold=confidence,
            )
        )

        logger.info(
            "DETECT: YOLO finished in %s ms, detections=%d",
            inference_time_ms,
            len(detections),
        )

        # -----------------------------
        # Prepare MongoDB document
        # -----------------------------
        now = datetime.utcnow()

        detection_doc = {
            "timestamp": now,
            "filename": file.filename or "image.jpg",
            "image_width": w,
            "image_height": h,
            "summary": summary.model_dump(),
            "detections": [d.model_dump() for d in detections],
            "inference_time_ms": inference_time_ms,
        }

        # -----------------------------
        # MongoDB
        # -----------------------------
        logger.info("DETECT: saving result to MongoDB")

        doc_id = db_manager.insert_detection(detection_doc)

        logger.info(
            "DETECT: MongoDB save completed, id=%s",
            doc_id,
        )

        # -----------------------------
        # Return response
        # -----------------------------
        logger.info("DETECT: returning successful response")

        return DetectionResponse(
            id=doc_id,
            timestamp=now,
            filename=file.filename or "image.jpg",
            image_width=w,
            image_height=h,
            summary=summary,
            detections=detections,
            annotated_image_base64=annotated_base64,
            inference_time_ms=inference_time_ms,
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(
            "Detection pipeline failed: %s",
            str(e),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Detection processing failed: {str(e)}",
        )


@router.get(
    "/health",
    response_model=HealthStatus,
    summary="System and database health check",
)
async def health_check():
    """
    Returns backend status, model readiness, and MongoDB Atlas connectivity.
    """

    return HealthStatus(
        status="online",
        version=settings.VERSION,
        model_loaded=yolo_service.model_loaded,
        database_connected=db_manager.check_health(),
        database_name=settings.DATABASE_NAME,
        active_classes=settings.CLASS_MAPPING,
    )