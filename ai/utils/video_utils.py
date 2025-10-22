import cv2

def get_camera_stream(source=0):
    try:
        cap = cv2.VideoCapture(int(source)) if str(source).isdigit() else cv2.VideoCapture(source)
        if not cap.isOpened():
            print(f"⚠️ Kamera açılamadı: {source}")
            return None
        return cap
    except Exception as e:
        print(f"❌ Kamera bağlantı hatası: {e}")
        return None
