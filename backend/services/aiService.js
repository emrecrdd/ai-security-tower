const axios = require('axios');
const FormData = require('form-data');
const Alarm = require('../models/Alarm');

class AIService {
  constructor() {
    this.isEnabled = process.env.AI_ENABLED === 'true';
    this.hfUrl = process.env.AI_SERVICE_URL; // Hugging Face base URL
  }

  async analyzeSecurityImage(imageBuffer, cameraId) {
    if (!this.isEnabled) return { success: false, error: 'AI kapalı' };

    console.log(`🤖 Hugging Face AI'ya frame gönderiliyor - Kamera: ${cameraId}`);

    try {
      // 🎯 HATA BURADA: Hugging Face Space FastAPI bekliyor, doğrudan FormData gönder
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: `frame-${cameraId}-${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });

      // ✅ DÜZELTME: Doğru endpoint ve header ayarları
      const response = await axios.post(
        `${this.hfUrl}/api/analyze-frame`, // Python backend'inizin endpoint'i
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Accept': 'application/json',
          },
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const result = response.data;

      if (!result || !result.success) {
        console.warn('⚠️ AI analiz başarısız:', result?.error);
        return { success: false, error: result?.error || 'AI analiz başarısız' };
      }

      console.log(`✅ AI tespitleri: ${result.detections?.length || 0} nesne`);

      // Alarm kontrolü
      if (result.detections?.length > 0) {
        await this.checkAndCreateAlarms(result.detections, cameraId);
      }

      return result;

    } catch (err) {
      console.error('❌ Hugging Face AI bağlantı hatası:', {
        message: err.message,
        url: `${this.hfUrl}/api/analyze-frame`,
        cameraId: cameraId
      });
      
      // Daha detaylı hata mesajı
      if (err.response) {
        console.error('❌ HTTP Hatası:', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('❌ İstek Hatası:', err.request);
      }
      
      return { 
        success: false, 
        error: err.message,
        details: 'Hugging Face Space bağlantı hatası' 
      };
    }
  }

  async checkAndCreateAlarms(detections, cameraId) {
    try {
      // Person tespiti için alarm oluştur
      const personDetection = detections.find(d => 
        d.label === 'person' && d.confidence > 0.6
      );
      
      if (personDetection) {
        await this.createAlarmFromDetection(personDetection, cameraId);
      }

      // Yüksek güvenilirlikte araç tespitleri
      const vehicleDetection = detections.find(d => 
        (d.label === 'car' || d.label === 'truck') && d.confidence > 0.7
      );
      
      if (vehicleDetection) {
        await this.createAlarmFromDetection(vehicleDetection, cameraId);
      }

    } catch (err) {
      console.error('❌ Alarm kontrol hatası:', err.message);
    }
  }

  async createAlarmFromDetection(detection, cameraId) {
    try {
      const objectTypes = { 
        person: 'İNSAN_TESPİTİ', 
        car: 'ARAÇ_TESPİTİ', 
        truck: 'ARAÇ_TESPİTİ' 
      };
      
      const alarmData = {
        cameraId: parseInt(cameraId),
        type: objectTypes[detection.label] || 'NESNE_TESPİTİ',
        objectType: detection.label,
        confidence: detection.confidence,
        riskLevel: detection.confidence > 0.7 ? 'HIGH' : 'MEDIUM',
        aiVerified: true,
        timestamp: new Date(),
        bbox: detection.bbox || null
      };

      const newAlarm = await Alarm.create(alarmData);
      
      // Socket.IO ile real-time bildirim
      if (global.io) {
        global.io.emit('newAlarm', newAlarm);
      }
      
      console.log(`🚨 Alarm oluşturuldu: ${alarmData.type} - %${(alarmData.confidence*100).toFixed(1)}`);
      return newAlarm;

    } catch (err) {
      console.error('❌ Alarm oluşturma hatası:', err.message);
      throw err;
    }
  }

  // 🔧 Servis durumunu kontrol et
  async checkServiceStatus() {
    try {
      const response = await axios.get(`${this.hfUrl}/api/health`, {
        timeout: 10000
      });
      return {
        status: 'active',
        pythonAI: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        status: 'inactive',
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new AIService();
