const axios = require('axios');
const FormData = require('form-data');
const Alarm = require('../models/Alarm');

class AIService {
  constructor() {
    this.isEnabled = process.env.AI_ENABLED === 'true';
    // Render ve HF Space URL’ini kullan
    this.pythonApiUrl = process.env.PYTHON_AI_URL || process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.retryDelay = 2000; // ms
    this.maxRetries = 3;
  }

  async analyzeSecurityImage(imageBuffer, cameraId) {
    if (!this.isEnabled) {
      console.log('⚠️ AI servisi devre dışı');
      return { success: false, detections: [] };
    }

    console.log(`🤖 Python AI'ya frame gönderiliyor - Kamera: ${cameraId}`);
    
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Deneme ${attempt}/${this.maxRetries}`);

        const formData = new FormData();
        formData.append('image', imageBuffer, `frame-${cameraId}-${Date.now()}.jpg`);
        formData.append('cameraId', cameraId.toString());

        const headers = formData.getHeaders();

        // HF Space auth token varsa ekle
        if (process.env.HF_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.HF_TOKEN}`;
        }

        const response = await axios.post(
          `${this.pythonApiUrl}/api/analyze-frame`,
          formData,
          { headers, timeout: 30000 }
        );

        console.log('🔍 DEBUG: Python AI cevabı geldi - Status:', response.status);

        const result = response.data;

        if (result.success) {
          console.log(`✅ AI analiz: ${result.detections?.length || 0} nesne tespit edildi`);
          if (result.detections && result.detections.length > 0) {
            await this.checkAndCreateAlarms(result.detections, cameraId);
          }
          return result;
        } else {
          throw new Error(result.error || 'Bilinmeyen Python AI hatası');
        }

      } catch (error) {
        lastError = error;
        console.error(`❌ Deneme ${attempt} başarısız:`, error.message);
        if (attempt < this.maxRetries) {
          console.log(`⏳ ${this.retryDelay/1000} saniye bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    console.error('❌ Tüm Python AI denemeleri başarısız');
    throw new Error(`Python AI bağlantı hatası: ${lastError.message}`);
  }

  async checkAndCreateAlarms(detections, cameraId) {
    if (!detections || !detections.length) return;

    const personDetection = detections.find(d => d.class === 'person' && d.confidence > 0.6);
    if (personDetection) {
      await this.createAlarmFromDetection(personDetection, cameraId);
    }
  }

  async createAlarmFromDetection(detection, cameraId) {
    try {
      const objectTypes = {
        'person': 'İNSAN_TESPİTİ',
        'car': 'ARAÇ_TESPİTİ', 
        'truck': 'ARAÇ_TESPİTİ'
      };

      const alarmData = {
        cameraId: parseInt(cameraId),
        type: objectTypes[detection.class] || 'NESNE_TESPİTİ',
        objectType: detection.class,
        confidence: detection.confidence,
        riskLevel: detection.confidence > 0.7 ? 'HIGH' : 'MEDIUM',
        aiVerified: true,
        timestamp: new Date()
      };

      const newAlarm = await Alarm.create(alarmData);

      // Real-time bildirim
      if (global.io) {
        global.io.emit('newAlarm', newAlarm);
      }

      console.log(`🚨 Alarm oluşturuldu: ${alarmData.type} - %${(alarmData.confidence*100).toFixed(1)}`);
      return newAlarm;

    } catch (error) {
      console.error('❌ Alarm oluşturma hatası:', error.message);
    }
  }
}

module.exports = new AIService();
