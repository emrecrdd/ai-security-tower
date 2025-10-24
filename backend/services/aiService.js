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

    const formData = new FormData();
    formData.append('file', imageBuffer, `frame-${cameraId}-${Date.now()}.jpg`); // "file" key Space ile uyumlu

    try {
      const response = await axios.post(
        `${this.hfUrl}/api/analyze-frame`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000
        }
      );

      const result = response.data;

      if (!result || !result.success) {
        throw new Error(result?.error || 'Hugging Face AI başarısız');
      }

      if (result.detections?.length) {
        await this.checkAndCreateAlarms(result.detections, cameraId);
      }

      return result;

    } catch (err) {
      console.error('❌ Hugging Face AI bağlantı hatası:', err.message);
      return { success: false, error: err.message };
    }
  }

  async checkAndCreateAlarms(detections, cameraId) {
    const personDetection = detections.find(d => d.label === 'person' && d.confidence > 0.6);
    if (personDetection) await this.createAlarmFromDetection(personDetection, cameraId);
  }

  async createAlarmFromDetection(detection, cameraId) {
    try {
      const objectTypes = { person: 'İNSAN_TESPİTİ', car: 'ARAÇ_TESPİTİ', truck: 'ARAÇ_TESPİTİ' };
      const alarmData = {
        cameraId: parseInt(cameraId),
        type: objectTypes[detection.label] || 'NESNE_TESPİTİ',
        objectType: detection.label,
        confidence: detection.confidence,
        riskLevel: detection.confidence > 0.7 ? 'HIGH' : 'MEDIUM',
        aiVerified: true,
        timestamp: new Date()
      };

      const newAlarm = await Alarm.create(alarmData);
      global.io?.emit('newAlarm', newAlarm);
      console.log(`🚨 Alarm oluşturuldu: ${alarmData.type} - %${(alarmData.confidence*100).toFixed(1)}`);
      return newAlarm;

    } catch (err) {
      console.error('❌ Alarm oluşturma hatası:', err.message);
    }
  }
}

module.exports = new AIService();
