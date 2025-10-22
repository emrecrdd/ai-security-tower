import os
import cv2
import time
import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", 0.6))
ALARM_COOLDOWN = int(os.getenv("ALARM_COOLDOWN", 3))

# 🎯 YOLO MODELİNİ GÜVENLİ ŞEKİLDE YÜKLE
# 🎯 YOLO MODELİNİ GÜVENLİ ŞEKİLDE YÜKLE
try:
    model = YOLO("yolov8n.pt")
    model.fuse = lambda *a, **kw: model  # 🚀 fuse işlemini devre dışı bırak
    print("✅ YOLOv8 modeli başarıyla yüklendi")
except Exception as e:
    print(f"❌ Model yükleme hatası: {e}")
    print("🔄 Model yeniden indiriliyor...")
    try:
        # Modeli yeniden indir
        model = YOLO("yolov8n.pt")
        model.fuse = lambda *a, **kw: model  # 🧩 burada da ekle
        print("✅ Model yeniden indirildi ve yüklendi")
    except Exception as e2:
        print(f"❌ Kritik model hatası: {e2}")
        exit(1)


recent_alarms = deque(maxlen=50)

def should_send_alarm(label, confidence):
    now = time.time()
    for recent_label, ts in recent_alarms:
        if recent_label == label and (now - ts) < ALARM_COOLDOWN:
            return False
    return confidence >= CONF_THRESHOLD

@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        print("🔍 DEBUG: Request geldi")
        
        if 'image' not in request.files:
            print("❌ DEBUG: image dosyası yok")
            return jsonify({'success': False, 'error': 'Görsel dosyası gerekli'}), 400
        
        file = request.files['image']
        camera_id = request.form.get('cameraId', 1)
        
        print(f"🔍 DEBUG: Dosya alındı - Kamera: {camera_id}")
        
        # Görselı oku
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            print("❌ DEBUG: Görsel decode edilemedi")
            return jsonify({'success': False, 'error': 'Görsel decode edilemedi'}), 400

        print(f"🔍 DEBUG: Frame boyutu - {frame.shape}")
        
        detections = []
        
        try:
            # 🎯 YOLO ANALİZ - GÜVENLİ
            print("🔍 DEBUG: YOLO analiz başlıyor...")
            results = model(frame, stream=True, verbose=False)
            
            for r in results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    label = model.names[cls]

                    if label in ["person", "car", "truck"]:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        
                        detection_data = {
                            'label': label,
                            'class': label,
                            'confidence': conf,
                            'bbox': [x1, y1, x2-x1, y2-y1],
                            'type': label
                        }
                        detections.append(detection_data)
                        
                        # ✅ CONFIDENCE FORMATI DÜZELTİLDİ
                        print(f"🎯 GERÇEK TESPİT: {label} - %{conf*100:.1f}")

            print(f"🔍 DEBUG: YOLO analiz tamamlandı - {len(detections)} tespit")

        except Exception as model_error:
            print(f"❌ CRITICAL: YOLO model hatası: {model_error}")
            import traceback
            traceback.print_exc()  # TAM HATA DETAYI
            return jsonify({
                'success': False, 
                'error': f'Model analiz hatası: {str(model_error)}',
                'detections': []
            }), 500

        return jsonify({
            'success': True,
            'detections': detections,
            'cameraId': camera_id,
            'timestamp': time.time()
        })
        
    except Exception as e:
        print(f"❌ CRITICAL: Genel hata: {e}")
        import traceback
        traceback.print_exc()  # TAM HATA DETAYI
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'active', 
        'model': 'YOLOv8n',
        'classes': ['person', 'car', 'truck']
    })

if __name__ == "__main__":
    print("🚀 GERÇEK Python AI API başlatılıyor...")
    print("📡 Endpoint: http://localhost:5001/api/analyze-frame")
    print("🔴 MOCK DATA: KAPALI - SADECE GERÇEK TESPİTLER")
    app.run(host='0.0.0.0', port=5001, debug=False)