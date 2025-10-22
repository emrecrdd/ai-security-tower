import os
import requests
from dotenv import load_dotenv

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")

def send_alarm(camera_id, alarm_type, confidence, object_type, risk_level="LOW"):
    try:
        payload = {
            "cameraId": camera_id,
            "type": alarm_type,
            "confidence": confidence,
            "objectType": object_type,
            "riskLevel": risk_level,
            "aiVerified": True
        }

        res = requests.post(BACKEND_URL, json=payload, timeout=5)
        if res.status_code == 201:
            print("✅ Alarm başarıyla backend’e gönderildi.")
        else:
            print(f"⚠️ Alarm gönderilemedi: {res.status_code} - {res.text}")

    except Exception as e:
        print(f"❌ Alarm gönderim hatası: {e}")
