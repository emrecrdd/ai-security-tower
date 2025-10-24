const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// 🎯 BASE64 kabul eden endpoint
router.post('/analyze-frame', async (req, res) => {
  try {
    console.log('📸 AI analiz isteği alındı - BASE64');

    // Önce req.body kontrol et
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Request body eksik' 
      });
    }

    const { frame, cameraId } = req.body;

    console.log('🔍 REQ.BODY:', Object.keys(req.body));

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
      error: error.message
    });
  }
});

module.exports = router;
