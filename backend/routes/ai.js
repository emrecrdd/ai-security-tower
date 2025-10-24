const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// 🎯 BASE64 kabul eden endpoint - MULTER KALDIRILDI
router.post('/analyze-frame', async (req, res) => {
  try {
    console.log('📸 AI analiz isteği alındı - BASE64');

    const { frame, cameraId } = req.body;

    if (!frame || !cameraId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Frame ve cameraId gerekiyor' 
      });
    }

    console.log(`🤖 Analiz başlıyor - Kamera: ${cameraId}, Boyut: ${frame.length} bytes`);

    // Base64 string'i buffer'a çevir
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // AI servisini çağır
    const result = await aiService.analyzeSecurityImage(imageBuffer, cameraId);

    if (!result.success) {
      console.warn(`❌ AI analiz başarısız: ${result.error}`);
      return res.status(500).json(result);
    }

    console.log(`✅ AI analiz tamamlandı: ${result.detections?.length || 0} tespit`);
    res.json(result);

  } catch (error) {
    console.error('❌ AI analiz hatası:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Internal server error'
    });
  }
});

// ✅ STATUS ENDPOINT - Servis durumunu kontrol et
router.get('/status', async (req, res) => {
  try {
    const status = await aiService.checkServiceStatus();
    res.json({
      status: 'active',
      pythonAI: process.env.AI_SERVICE_URL,
      enabled: process.env.AI_ENABLED === 'true',
      serviceStatus: status,
      message: 'AI servisi çalışıyor - Hugging Face uyumlu',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// 🔧 HEALTH CHECK - Basit servis kontrolü
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'AI Analysis Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
