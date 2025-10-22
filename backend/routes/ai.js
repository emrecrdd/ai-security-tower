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
    
    console.log(`✅ AI cevabı: ${result.detections?.length || 0} tespit`);
    res.json(result);
    
  } catch (error) {
    console.error('❌ AI analiz hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ STATUS ENDPOINT'İ EKLE
router.get('/status', (req, res) => {
  res.json({ 
    status: 'active', 
    pythonAI: 'http://localhost:5001',
    enabled: true,
    message: 'AI servisi çalışıyor - Multer ile',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;