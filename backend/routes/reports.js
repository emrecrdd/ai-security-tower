// backend/routes/reports.js - SADECE BU KISMI EKLE
const express = require("express");
const router = express.Router();
const PDFGenerator = require("../utils/pdfGenerator");

// 📄 PDF ROUTE'LARI
router.get("/pdf/daily", async (req, res) => {
  try {
    console.log('📄 Günlük PDF isteği');
    
    // Test verisi - gerçek veri yerine
    const testData = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalAlarms: 15,
        aiVerifiedAlarms: 12,
        alarmTypes: { "Hareket": 8, "Yüz Tanıma": 4, "Araç": 3 },
        objectTypes: { "person": 10, "car": 5 },
        riskDistribution: { "HIGH": 3, "MEDIUM": 5, "LOW": 7 },
        hourlyDistribution: [
          { hour: "08:00", count: 2 }, { hour: "12:00", count: 5 },
          { hour: "18:00", count: 3 }, { hour: "22:00", count: 5 }
        ]
      },
      alarms: [
        {
          id: 1,
          timestamp: new Date(),
          cameraId: 1,
          type: "Hareket",
          objectType: "person",
          riskLevel: "MEDIUM",
          aiVerified: true
        }
      ]
    };
    
    const result = await PDFGenerator.generateDailyReport(testData);
    
    res.json({
      success: true,
      message: "Günlük PDF oluşturuldu",
      ...result
    });
    
  } catch (error) {
    console.error('Günlük PDF hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/pdf/weekly", async (req, res) => {
  try {
    console.log('📄 Haftalık PDF isteği');
    
    // Test verisi
    const testData = {
      period: {
        start: "2024-01-14",
        end: "2024-01-20"
      },
      dailyTrend: [
        { date: "2024-01-14", total: 12, verified: 9, highRisk: 2 },
        { date: "2024-01-15", total: 15, verified: 12, highRisk: 3 },
        { date: "2024-01-16", total: 8, verified: 6, highRisk: 1 },
        { date: "2024-01-17", total: 18, verified: 15, highRisk: 4 },
        { date: "2024-01-18", total: 10, verified: 8, highRisk: 2 },
        { date: "2024-01-19", total: 14, verified: 11, highRisk: 3 },
        { date: "2024-01-20", total: 9, verified: 7, highRisk: 1 }
      ],
      totalAlarms: 86,
      aiAccuracy: 78.2
    };
    
    const result = await PDFGenerator.generateWeeklyReport(testData);
    
    res.json({
      success: true,
      message: "Haftalık PDF oluşturuldu",
      ...result
    });
    
  } catch (error) {
    console.error('Haftalık PDF hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/pdf/test", async (req, res) => {
  try {
    console.log('🧪 Test PDF isteği');
    
    // Basit test verisi
    const testData = {
      date: "2024-01-15",
      summary: {
        totalAlarms: 25,
        aiVerifiedAlarms: 20,
        alarmTypes: { "Test": 25 },
        objectTypes: { "test": 25 },
        riskDistribution: { "HIGH": 5, "MEDIUM": 10, "LOW": 10 }
      },
      alarms: []
    };
    
    const result = await PDFGenerator.generateDailyReport(testData);
    
    res.json({
      success: true,
      message: "Test PDF oluşturuldu",
      ...result
    });
    
  } catch (error) {
    console.error('Test PDF hatası:', error);
    res.status(500).json({ error: error.message });
  }
});
// backend/routes/reports.js - YENİ STATS ROUTE
router.get('/stats', async (req, res) => {
  try {
    // Örnek dinamik veri - gerçek uygulamada database'den çek
    const stats = {
      totalAlarms: 245,
      aiAccuracy: 87.5,
      highRiskAlarms: 34,
      dailyAverage: 35,
      alarmTypes: {
        'Hareket Tespiti': 120,
        'Yasaklı Bölge': 45,
        'Nesne Tanıma': 56,
        'Yüz Tanıma': 24
      },
      dailyTrend: [
        { date: '2024-01-15', total: 28, highRisk: 4 },
        { date: '2024-01-16', total: 32, highRisk: 6 },
        { date: '2024-01-17', total: 45, highRisk: 8 },
        { date: '2024-01-18', total: 38, highRisk: 5 },
        { date: '2024-01-19', total: 52, highRisk: 12 },
        { date: '2024-01-20', total: 29, highRisk: 3 },
        { date: '2024-01-21', total: 35, highRisk: 7 }
      ],
      hourlyDistribution: [
        { hour: '00:00', count: 8 },
        { hour: '04:00', count: 5 },
        { hour: '08:00', count: 15 },
        { hour: '12:00', count: 28 },
        { hour: '16:00', count: 32 },
        { hour: '20:00', count: 18 }
      ],
      riskDistribution: {
        HIGH: 34,
        MEDIUM: 89,
        LOW: 122
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// ✅ PDF İNDİRME
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = require('path').join(process.cwd(), 'reports', filename);
    
    if (!require('fs').existsSync(filepath)) {
      return res.status(404).json({ error: 'PDF bulunamadı' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    require('fs').createReadStream(filepath).pipe(res);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;