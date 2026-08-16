import base64
import io
import cv2
import numpy as np
from PIL import Image
from typing import List, Tuple
from app.models.detection import BoundingBox, DetectionSummary
from app.core.config import settings

# BGR Colors for OpenCV
COLOR_MAP = {
    0: (60, 200, 70),     # Helmet: Emerald Green (BGR)
    1: (40, 40, 235),     # No-Helmet: Danger Red (BGR)
    2: (25, 120, 245),    # No-Vest: Hazard Orange/Red (BGR)
    3: (220, 180, 20),    # Person: High-tech Cyan/Blue (BGR)
    4: (50, 220, 120)     # Vest: Bright Safety Green (BGR)
}

COLOR_BG_MAP = {
    0: (30, 120, 40),
    1: (20, 20, 160),
    2: (15, 70, 160),
    3: (140, 100, 10),
    4: (30, 130, 60)
}


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes into an OpenCV BGR numpy array."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image bytes. Unsupported or corrupted format.")
    return img


def encode_image_to_base64(image: np.ndarray, quality: int = 90) -> str:
    """Encode OpenCV BGR image to base64 JPEG string."""
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    success, buffer = cv2.imencode(".jpg", image, encode_params)
    if not success:
        raise ValueError("Failed to encode image to JPEG.")
    encoded = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"


def draw_bounding_boxes(
    image: np.ndarray,
    detections: List[BoundingBox],
    summary: DetectionSummary
) -> np.ndarray:
    """
    Render bounding boxes, confidence tags, and a top industrial HUD bar onto the image.
    """
    annotated = image.copy()
    h, w = annotated.shape[:2]

    # Dynamic line thickness and font scale based on image dimensions
    scale = max(0.5, min(w, h) / 1000.0)
    line_thickness = max(2, int(scale * 3.5))
    font_scale = max(0.45, scale * 0.7)
    font_thickness = max(1, int(scale * 2.0))

    # 1. Draw Bounding Boxes
    for det in detections:
        x1, y1, x2, y2 = int(det.x1), int(det.y1), int(det.x2), int(det.y2)
        # Ensure within image boundaries
        x1 = max(0, min(x1, w - 1))
        y1 = max(0, min(y1, h - 1))
        x2 = max(0, min(x2, w - 1))
        y2 = max(0, min(y2, h - 1))

        class_id = det.class_id
        color = COLOR_MAP.get(class_id, (200, 200, 200))
        bg_color = COLOR_BG_MAP.get(class_id, (50, 50, 50))

        # Main Bounding Box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, line_thickness)

        # Label text
        label_text = f"{det.class_name} {int(det.confidence * 100)}%"
        (text_w, text_h), baseline = cv2.getTextSize(
            label_text, cv2.FONT_HERSHEY_DUPLEX, font_scale, font_thickness
        )

        # Label badge position (above box, or inside if near top border)
        badge_y1 = y1 - text_h - 10
        badge_y2 = y1
        if badge_y1 < 0:
            badge_y1 = y1
            badge_y2 = y1 + text_h + 10

        badge_x1 = x1
        badge_x2 = min(w, x1 + text_w + 12)

        # Draw filled background for label badge
        cv2.rectangle(annotated, (badge_x1, badge_y1), (badge_x2, badge_y2), bg_color, -1)
        cv2.rectangle(annotated, (badge_x1, badge_y1), (badge_x2, badge_y2), color, 1)

        # Draw text
        text_origin_y = badge_y2 - 5 if badge_y1 < y1 else badge_y1 + text_h + 3
        cv2.putText(
            annotated,
            label_text,
            (badge_x1 + 6, text_origin_y),
            cv2.FONT_HERSHEY_DUPLEX,
            font_scale,
            (255, 255, 255),
            font_thickness,
            cv2.LINE_AA,
        )

    # 2. Draw Top Industrial HUD Banner
    hud_h = max(38, int(h * 0.055))
    hud_overlay = annotated.copy()
    
    # HUD background color based on status
    if summary.safety_status == "COMPLIANT":
        hud_color = (25, 60, 25)      # Dark Green
        status_text = f"SAFETY STATUS: ALL COMPLIANT | WORKERS: {summary.worker_count} | HELMETS: {summary.helmet_count} | VESTS: {summary.vest_count}"
        accent_color = (60, 200, 70)
    elif summary.safety_status == "VIOLATION":
        hud_color = (25, 25, 75)      # Dark Red
        status_text = f"SAFETY STATUS: {summary.total_violations} VIOLATION(S) DETECTED | NO-HELMET: {summary.no_helmet_count} | NO-VEST: {summary.no_vest_count}"
        accent_color = (40, 40, 235)
    else:
        hud_color = (30, 30, 30)      # Dark Slate
        status_text = f"SAFETY STATUS: NO ACTIVE WORKERS DETECTED"
        accent_color = (200, 200, 200)

    # Draw semi-transparent HUD bar
    cv2.rectangle(hud_overlay, (0, 0), (w, hud_h), hud_color, -1)
    cv2.addWeighted(hud_overlay, 0.85, annotated, 0.15, 0, annotated)

    # Bottom accent line for HUD
    cv2.line(annotated, (0, hud_h), (w, hud_h), accent_color, max(2, int(scale * 2)))

    # HUD Text
    hud_font_scale = max(0.42, scale * 0.55)
    cv2.putText(
        annotated,
        status_text,
        (15, int(hud_h * 0.68)),
        cv2.FONT_HERSHEY_DUPLEX,
        hud_font_scale,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )

    return annotated
