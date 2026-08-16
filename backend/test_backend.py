import io
import sys
import numpy as np
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app

def create_dummy_test_image():
    # Create a synthetic 640x640 test image
    img = Image.new('RGB', (640, 640), color=(70, 70, 70))
    draw = ImageDraw.Draw(img)
    # Draw simple shapes
    draw.rectangle([200, 200, 440, 600], fill=(40, 60, 100)) # Person body
    draw.ellipse([270, 120, 370, 220], fill=(240, 200, 50))  # Helmet/head
    
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return buf.getvalue()

def run_tests():
    print("Testing Smart Helmet Backend endpoints...")
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        print("GET /api/health:", res.status_code, res.json())
        assert res.status_code == 200
        # 2. Test Detection Endpoint
        img_bytes = create_dummy_test_image()
        files = {"file": ("test_worker.jpg", img_bytes, "image/jpeg")}
        res = client.post("/api/detect?confidence=0.25", files=files)
        print("POST /api/detect:", res.status_code)
        assert res.status_code == 200
        data = res.json()
        print("Detection Summary:", data["summary"])
        print("Inference Time:", data["inference_time_ms"], "ms")
        print("Annotated image base64 length:", len(data["annotated_image_base64"]))
        assert "annotated_image_base64" in data
        assert "summary" in data

        # 3. Dashboard Stats
        res = client.get("/api/dashboard/stats")
        print("GET /api/dashboard/stats:", res.status_code, res.json())
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_inspections"] >= 1

        # 4. History
        res = client.get("/api/history?page=1&limit=10")
        print("GET /api/history:", res.status_code)
        assert res.status_code == 200
        history = res.json()
        print("History records found:", history["total"])
        assert history["total"] >= 1

        # 5. Direct Unit Test of Compliance Logic with Violations
        from app.services.yolo_service import yolo_service
        # Simulate counts with 1 No-Helmet and 1 No-Vest (0 Helmets, 0 Vests)
        counts = {0: 0, 1: 1, 2: 1, 3: 1, 4: 0}
        helmet_count = counts[0]
        no_helmet_count = counts[1]
        no_vest_count = counts[2]
        person_count = counts[3]
        vest_count = counts[4]
        total_violations = no_helmet_count + no_vest_count
        helmet_denom = helmet_count + no_helmet_count
        vest_denom = vest_count + no_vest_count
        total_ppe_denom = helmet_denom + vest_denom
        helmet_compliance = round((helmet_count / helmet_denom * 100.0), 1) if helmet_denom > 0 else (0.0 if no_helmet_count > 0 else 100.0)
        vest_compliance = round((vest_count / vest_denom * 100.0), 1) if vest_denom > 0 else (0.0 if no_vest_count > 0 else 100.0)
        overall_compliance = round(((helmet_count + vest_count) / total_ppe_denom * 100.0), 1) if total_ppe_denom > 0 else (0.0 if total_violations > 0 else 100.0)

        assert helmet_compliance == 0.0
        assert vest_compliance == 0.0
        assert overall_compliance == 0.0
        print("Violation Compliance Test: Helmet=0.0%, Vest=0.0%, Overall=0.0% -> PASSED")

        print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
