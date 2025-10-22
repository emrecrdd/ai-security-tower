from ultralytics import YOLO

def download_model():
    print("📦 YOLOv8n modeli indiriliyor...")
    model = YOLO("yolov8n.pt")
    print("✅ Model hazır.")

if __name__ == "__main__":
    download_model()
