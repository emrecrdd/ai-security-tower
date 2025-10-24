const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiService = require('../services/aiService');

const upload = multer({ storage: multer.memoryStorage() });

// 🎯 Frontend'den gelen frame'leri analiz et
router.post('/analyze-frame', upload.single('image'), async (req, res) => {
  try {
    console.log('📸 AI analiz isteği alındı');

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Görsel dosyası gerekiyor' 
      });
    }

    const { cameraId } = req.body;
    const imageBuffer = req.file.buffer;

    console.log(`🤖 Analiz başlıyor - Kamera: ${cameraId}, Boyut: ${imageBuffer.length} bytes`);

    const result = await aiService.analyzeSecurityImage(imageBuffer, cameraId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    console.log(`✅ AI cevabı: ${result.detections?.length || 0} tespit`);
    res.json(result);

  } catch (error) {
    console.error('❌ AI analiz hatası:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ STATUS ENDPOINT
router.get('/status', (req, res) => {
  res.json({ 
    status: 'active',
    pythonAI: process.env.AI_SERVICE_URL || 'Hugging Face Space URL',
    enabled: process.env.AI_ENABLED === 'true',
    message: 'AI servisi çalışıyor - Hugging Face uyumlu',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
