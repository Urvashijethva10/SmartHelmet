import logging
import os
import time
from pathlib import Path
from typing import Optional, Tuple, List
import numpy as np
from ultralytics import YOLO

from app.core.config import settings
from app.models.detection import BoundingBox, DetectionSummary, DetectionResponse
from app.utils.image_utils import decode_image_bytes, draw_bounding_boxes, encode_image_to_base64

logger = logging.getLogger(__name__)


class YOLOService:
    def __init__(self):
        self.model: Optional[YOLO] = None
        self.model_loaded: bool = False
        self.model_path: str = ""

    def load_model(self):
        """Locate and load the YOLO11 best.pt weights."""
        possible_paths = [
            Path(settings.MODEL_PATH),
            Path(__file__).resolve().parent.parent.parent.parent / "best.pt",
            Path(__file__).resolve().parent.parent.parent / "best.pt",
            Path("best.pt"),
            Path("../best.pt"),
        ]

        found_path = None
        for p in possible_paths:
            if p.exists() and p.is_file():
                found_path = str(p.resolve())
                break

        if not found_path:
            logger.error("Could not find best.pt in any searched paths: %s", [str(p) for p in possible_paths])
            self.model_loaded = False
            return

        try:
            logger.info("Loading YOLO11 model from: %s", found_path)
            self.model = YOLO(found_path)
            self.model_path = found_path
            self.model_loaded = True
            logger.info("YOLO11 model successfully loaded. Model classes: %s", getattr(self.model, "names", {}))
        except Exception as e:
            logger.error("Failed to load YOLO model: %s", str(e))
            self.model_loaded = False

    def predict(
        self,
        image_bytes: bytes,
        filename: str = "image.jpg",
        confidence_threshold: Optional[float] = None,
    ) -> Tuple[DetectionSummary, List[BoundingBox], str, float, int, int]:
        """
        Run inference on image bytes, calculate PPE safety metrics, and generate annotated image.
        """
        if not self.model_loaded or self.model is None:
            self.load_model()
            if not self.model_loaded or self.model is None:
                raise RuntimeError("YOLO model could not be loaded. Please ensure best.pt is present.")

        conf = confidence_threshold if confidence_threshold is not None else settings.CONFIDENCE_THRESHOLD

        # Decode image
        cv_img = decode_image_bytes(image_bytes)
        h, w = cv_img.shape[:2]

        start_time = time.perf_counter()
        
        # Run YOLO11 prediction
        logger.info(
        "YOLO: image size before inference: width=%d height=%d",
        w,
        h,
    )

        logger.info("YOLO: starting CPU inference")

        results = self.model.predict(
        source=cv_img,
        conf=conf,
        iou=settings.IOU_THRESHOLD,
        imgsz=640,
        device="cpu",
        verbose=False,
    )

        logger.info("YOLO: inference completed")
        
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Parse detected bounding boxes
        detections: List[BoundingBox] = []
        counts = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                xyxy = box.xyxy[0].cpu().numpy().tolist()
                class_id = int(box.cls[0].cpu().numpy())
                confidence = float(box.conf[0].cpu().numpy())

                class_name = settings.CLASS_MAPPING.get(class_id, f"Class-{class_id}")
                if class_id in counts:
                    counts[class_id] += 1

                detections.append(
                    BoundingBox(
                        x1=round(xyxy[0], 2),
                        y1=round(xyxy[1], 2),
                        x2=round(xyxy[2], 2),
                        y2=round(xyxy[3], 2),
                        class_id=class_id,
                        class_name=class_name,
                        confidence=round(confidence, 4),
                    )
                )

        # Calculate safety metrics based on exact 5 classes:
        # 0: Helmet, 1: No-Helmet, 2: No-Vest, 3: Person, 4: Vest
        helmet_count = counts[0]
        no_helmet_count = counts[1]
        no_vest_count = counts[2]
        person_count = counts[3]
        vest_count = counts[4]

        # Total persons detected
        worker_count = person_count

        # Violations count
        total_violations = no_helmet_count + no_vest_count

        violations_list: List[str] = []
        if no_helmet_count > 0:
            violations_list.append(f"{no_helmet_count} Worker(s) detected WITHOUT Helmet (Safety Violation)")
        if no_vest_count > 0:
            violations_list.append(f"{no_vest_count} Worker(s) detected WITHOUT Safety Vest (Safety Violation)")

        # Compliance percentages
        helmet_denom = helmet_count + no_helmet_count
        vest_denom = vest_count + no_vest_count
        total_ppe_denom = helmet_denom + vest_denom

        helmet_compliance = round((helmet_count / helmet_denom * 100.0), 1) if helmet_denom > 0 else (0.0 if no_helmet_count > 0 else 100.0)
        vest_compliance = round((vest_count / vest_denom * 100.0), 1) if vest_denom > 0 else (0.0 if no_vest_count > 0 else 100.0)
        overall_compliance = round(((helmet_count + vest_count) / total_ppe_denom * 100.0), 1) if total_ppe_denom > 0 else (0.0 if total_violations > 0 else 100.0)

        # Safety status classification
        if total_violations > 0:
            safety_status = "VIOLATION"
        elif worker_count > 0 or helmet_count > 0 or vest_count > 0:
            safety_status = "COMPLIANT"
        else:
            safety_status = "NO_WORKERS"

        summary = DetectionSummary(
            worker_count=worker_count,
            helmet_count=helmet_count,
            no_helmet_count=no_helmet_count,
            vest_count=vest_count,
            no_vest_count=no_vest_count,
            total_violations=total_violations,
            helmet_compliance_rate=helmet_compliance,
            vest_compliance_rate=vest_compliance,
            overall_compliance_rate=overall_compliance,
            safety_status=safety_status,
            violations=violations_list,
        )

        # Draw visual bounding boxes and HUD watermark
        annotated_cv_img = draw_bounding_boxes(cv_img, detections, summary)
        annotated_base64 = encode_image_to_base64(annotated_cv_img)

        return summary, detections, annotated_base64, inference_time_ms, w, h


yolo_service = YOLOService()
