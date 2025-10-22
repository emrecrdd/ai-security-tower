// backend/controllers/reportController.js - YENİ
const Alarm = require("../models/Alarm");
const { Op } = require("sequelize");

// Günlük rapor oluştur
exports.getDailyReport = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const alarms = await Alarm.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // İstatistikleri hesapla
    const stats = {
      totalAlarms: alarms.length,
      aiVerifiedAlarms: alarms.filter(a => a.aiVerified).length,
      alarmTypes: alarms.reduce((acc, alarm) => {
        acc[alarm.type] = (acc[alarm.type] || 0) + 1;
        return acc;
      }, {}),
      objectTypes: alarms.reduce((acc, alarm) => {
        if (alarm.objectType) {
          acc[alarm.objectType] = (acc[alarm.objectType] || 0) + 1;
        }
        return acc;
      }, {}),
      riskDistribution: alarms.reduce((acc, alarm) => {
        acc[alarm.riskLevel] = (acc[alarm.riskLevel] || 0) + 1;
        return acc;
      }, {}),
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => {
        const hourAlarms = alarms.filter(a => 
          new Date(a.timestamp).getHours() === hour
        );
        return {
          hour: `${hour}:00`,
          count: hourAlarms.length
        };
      })
    };

    res.json({
      date,
      summary: stats,
      alarms: alarms.slice(0, 50) // Son 50 alarm
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Haftalık trend raporu
exports.getWeeklyTrend = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const alarms = await Alarm.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Günlük trend verisi
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAlarms = alarms.filter(a => 
        a.timestamp.toISOString().split('T')[0] === dateStr
      );

      dailyTrend.push({
        date: dateStr,
        total: dayAlarms.length,
        verified: dayAlarms.filter(a => a.aiVerified).length,
        highRisk: dayAlarms.filter(a => a.riskLevel === 'HIGH').length
      });
    }

    res.json({
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      dailyTrend,
      totalAlarms: alarms.length,
      aiAccuracy: alarms.length > 0 ? 
        (alarms.filter(a => a.aiVerified).length / alarms.length * 100).toFixed(1) : 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Kamera bazlı rapor
exports.getCameraReport = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const alarms = await Alarm.findAll({
      where: {
        cameraId,
        timestamp: {
          [Op.gte]: startDate
        }
      }
    });

    const report = {
      cameraId: parseInt(cameraId),
      period: `${days} gün`,
      totalAlarms: alarms.length,
      aiVerified: alarms.filter(a => a.aiVerified).length,
      riskBreakdown: alarms.reduce((acc, alarm) => {
        acc[alarm.riskLevel] = (acc[alarm.riskLevel] || 0) + 1;
        return acc;
      }, {}),
      objectBreakdown: alarms.reduce((acc, alarm) => {
        if (alarm.objectType) {
          acc[alarm.objectType] = (acc[alarm.objectType] || 0) + 1;
        }
        return acc;
      }, {}),
      mostActiveHours: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        count: alarms.filter(a => new Date(a.timestamp).getHours() === hour).length
      })).sort((a, b) => b.count - a.count).slice(0, 5)
    };

    res.json(report);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};