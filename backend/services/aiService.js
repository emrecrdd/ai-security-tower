const axios = require('axios');
const FormData = require('form-data');
const Alarm = require('../models/Alarm');

class AIService {
  constructor() {
    this.isEnabled = process.env.AI_ENABLED === 'true';
    this.pythonApiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
  }

  async analyzeSecurityImage(imageBuffer, cameraId) {
    if (!this.isEnabled) return { success: false, error: 'AI kapalı' };
    
    console.log(`🤖 Python AI'ya frame gönderiliyor - Kamera: ${cameraId}`);
    
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Deneme ${attempt}/${maxRetries}`);
        const formData = new FormData();
        formData.append('image', imageBuffer, `frame-${cameraId}-${Date.now()}.jpg`);
        formData.append('cameraId', cameraId.toString());

        const response = await axios.post(
          `${this.pythonApiUrl}/api/analyze-frame`,
          formData,
          { headers: formData.getHeaders(), timeout: 30000 }
        );

        const result = response.data;
        if (result.success) {
          if (result.detections?.length) {
            await this.checkAndCreateAlarms(result.detections, cameraId);
          }
          return result;
        } else throw new Error(result.error);

      } catch (error) {
        lastError = error;
        console.error(`❌ Deneme ${attempt} başarısız:`, error.message);
        if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.error('❌ Tüm Python AI denemeleri başarısız');
    throw new Error(`Python AI bağlantı hatası: ${lastError.message}`);
  }

  async checkAndCreateAlarms(detections, cameraId) {
    const personDetection = detections.find(d => d.class === 'person' && d.confidence > 0.6);
    if (personDetection) await this.createAlarmFromDetection(personDetection, cameraId);
  }

  async createAlarmFromDetection(detection, cameraId) {
    try {
      const objectTypes = { person: 'İNSAN_TESPİTİ', car: 'ARAÇ_TESPİTİ', truck: 'ARAÇ_TESPİTİ' };
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
      global.io?.emit('newAlarm', newAlarm);
      console.log(`🚨 Alarm oluşturuldu: ${alarmData.type} - %${(alarmData.confidence*100).toFixed(1)}`);
      return newAlarm;
    } catch (error) {
      console.error('❌ Alarm oluşturma hatası:', error);
    }
  }
}

module.exports = new AIService();
