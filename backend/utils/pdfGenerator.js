// backend/utils/pdfGenerator.js - TÜRKÇE KARAKTER DESTEKLİ
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Font dosyalarının yolu - bu fontları projene eklemelisin
    this.fontPaths = {
      normal: path.join(process.cwd(), 'backend', 'fonts', 'DejaVuSans.ttf'),
      bold: path.join(process.cwd(), 'backend', 'fonts', 'DejaVuSans-Bold.ttf'),
      italic: path.join(process.cwd(), 'backend', 'fonts', 'DejaVuSans-Oblique.ttf')
    };

    // Fontlar yoksa fallback olarak Helvetica kullan (Türkçe karakter sorunlu)
    this.useUnicodeFonts = fs.existsSync(this.fontPaths.normal);

    this.colors = {
      primary: '#1a5276',
      secondary: '#2c3e50',
      accent: '#e67e22',
      success: '#27ae60',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#3498db',
      light: '#ecf0f1',
      dark: '#2c3e50',
      border: '#bdc3c7'
    };
  }

  // Font ayarları
  setupFonts(doc, style = 'normal') {
    if (this.useUnicodeFonts) {
      switch(style) {
        case 'bold':
          doc.font(this.fontPaths.bold);
          break;
        case 'italic':
          doc.font(this.fontPaths.italic);
          break;
        default:
          doc.font(this.fontPaths.normal);
      }
    } else {
      // Fallback fontlar - Türkçe karakterler bozuk olabilir
      switch(style) {
        case 'bold':
          doc.font('Helvetica-Bold');
          break;
        case 'italic':
          doc.font('Helvetica-Oblique');
          break;
        default:
          doc.font('Helvetica');
      }
    }
  }

  // GÜNLÜK RAPOR PDF
  async generateDailyReport(reportData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Günlük PDF oluşturuluyor...');
        
        const doc = new PDFDocument({ 
          margin: 0,
          size: 'A4',
          autoFirstPage: false // Manuel sayfa yönetimi
        });
        
        const filename = `gunluk-rapor-${Date.now()}.pdf`;
        const filepath = path.join(this.reportsDir, filename);
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // İlk sayfayı ekle
        doc.addPage();
        this.createDailyPDF(doc, reportData);

        doc.end();

        stream.on('finish', () => {
          console.log('✅ Günlük PDF oluşturuldu:', filename);
          resolve({
            success: true,
            filepath: filepath,
            filename: filename,
            url: `/api/reports/download/${filename}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        console.error('❌ Günlük PDF hatası:', error);
        reject(error);
      }
    });
  }

  // HAFTALIK RAPOR PDF
  async generateWeeklyReport(reportData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Haftalık PDF oluşturuluyor...');
        
        const doc = new PDFDocument({ 
          margin: 0,
          size: 'A4',
          autoFirstPage: false
        });
        
        const filename = `haftalik-rapor-${Date.now()}.pdf`;
        const filepath = path.join(this.reportsDir, filename);
        
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        doc.addPage();
        this.createWeeklyPDF(doc, reportData);

        doc.end();

        stream.on('finish', () => {
          console.log('✅ Haftalık PDF oluşturuldu:', filename);
          resolve({
            success: true,
            filepath: filepath,
            filename: filename,
            url: `/api/reports/download/${filename}`
          });
        });

        stream.on('error', reject);

      } catch (error) {
        console.error('❌ Haftalık PDF hatası:', error);
        reject(error);
      }
    });
  }

  // GÜNLÜK PDF İÇERİĞİ
  createDailyPDF(doc, reportData) {
    let yPosition = 50;

    try {
      // 1. BAŞLIK
      yPosition = this.createHeader(doc, 'GUNLUK GUVENLIK RAPORU', reportData.date, yPosition);
      
      // 2. ÖZET
      yPosition = this.createDailySummary(doc, reportData.summary, yPosition);
      
      // 3. ALARM TİPLERİ
      yPosition = this.createAlarmTypes(doc, reportData.summary.alarmTypes, yPosition);
      
      // 4. NESNE TİPLERİ
      yPosition = this.createObjectTypes(doc, reportData.summary.objectTypes, yPosition);
      
      // 5. RİSK DAĞILIMI
      yPosition = this.createRiskDistribution(doc, reportData.summary.riskDistribution, yPosition);
      
      // 6. SAATLİK DAĞILIM
      yPosition = this.createHourlyDistribution(doc, reportData.summary.hourlyDistribution, yPosition);
      
      // 7. SON ALARMLAR
      yPosition = this.createRecentAlarms(doc, reportData.alarms, yPosition);
      
      // 8. ALT BİLGİ
      this.createFooter(doc, 'Gunluk Rapor');

    } catch (error) {
      console.error('Gunluk PDF hatasi:', error);
      this.createEmergencyPDF(doc);
    }
  }

  // HAFTALIK PDF İÇERİĞİ
  createWeeklyPDF(doc, reportData) {
    let yPosition = 50;

    try {
      // 1. BAŞLIK
      yPosition = this.createHeader(doc, 'HAFTALIK GUVENLIK RAPORU', 
        `${reportData.period.start} - ${reportData.period.end}`, yPosition);
      
      // 2. HAFTALIK ÖZET
      yPosition = this.createWeeklySummary(doc, reportData, yPosition);
      
      // 3. GÜNLÜK TREND
      yPosition = this.createDailyTrend(doc, reportData.dailyTrend, yPosition);
      
      // 4. PERFORMANS ANALİZİ
      yPosition = this.createPerformanceAnalysis(doc, reportData, yPosition);
      
      // 5. ALT BİLGİ
      this.createFooter(doc, 'Haftalik Rapor');

    } catch (error) {
      console.error('Haftalik PDF hatasi:', error);
      this.createEmergencyPDF(doc);
    }
  }

  // ORTAK BAŞLIK
  createHeader(doc, title, period, yPosition) {
    // BAŞLIK ARKA PLANI
    doc.fillColor(this.colors.primary)
       .rect(0, 0, 612, 100)
       .fill();
    
    // ANA BAŞLIK
    this.setupFonts(doc, 'bold');
    doc.fillColor('#ffffff')
       .fontSize(20)
       .text(title, 50, 35, { align: 'center' });
    
    // RAPOR DÖNEMİ
    this.setupFonts(doc, 'normal');
    doc.fillColor('#d6eaf8')
       .fontSize(14)
       .text(period, 50, 65, { align: 'center' });
    
    return yPosition + 120;
  }

  // GÜNLÜK ÖZET
  createDailySummary(doc, summary, yPosition) {
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(16)
       .text('📊 GUNLUK OZET', 50, yPosition);
    
    const totalAlarms = summary.totalAlarms || 0;
    const aiVerified = summary.aiVerifiedAlarms || 0;
    const accuracy = totalAlarms > 0 ? (aiVerified / totalAlarms * 100) : 0;
    
    let currentY = yPosition + 30;
    
    // METRİK KUTULARI
    const metrics = [
      { label: 'TOPLAM ALARM', value: totalAlarms, color: this.colors.danger, icon: '🚨' },
      { label: 'AI DOGRULANAN', value: aiVerified, color: this.colors.success, icon: '🤖' },
      { label: 'DOGRULUK ORANI', value: '%' + accuracy.toFixed(1), color: this.colors.info, icon: '🎯' },
      { label: 'FARKLI TIPLER', value: Object.keys(summary.alarmTypes || {}).length, color: this.colors.warning, icon: '📝' }
    ];
    
    let x = 50;
    metrics.forEach(metric => {
      // KUTU
      doc.fillColor(metric.color)
         .rect(x, currentY, 120, 60)
         .fill();
      
      // İKON
      doc.fillColor('#ffffff')
         .fontSize(16)
         .text(metric.icon, x + 10, currentY + 10);
      
      // DEĞER
      this.setupFonts(doc, 'bold');
      doc.fillColor('#ffffff')
         .fontSize(14)
         .text(metric.value.toString(), x + 35, currentY + 15);
      
      // ETİKET
      this.setupFonts(doc, 'normal');
      doc.fillColor('#ffffff')
         .fontSize(9)
         .text(metric.label, x + 10, currentY + 40, { width: 100, align: 'center' });
      
      x += 130;
    });
    
    return currentY + 80;
  }

  // ALARM TİPLERİ
  createAlarmTypes(doc, alarmTypes, yPosition) {
    if (yPosition > 500) {
      doc.addPage();
      yPosition = 50;
    }
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('🔔 ALARM TIPLERI', 50, yPosition);
    
    if (!alarmTypes || Object.keys(alarmTypes).length === 0) {
      this.setupFonts(doc, 'normal');
      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .text('Bu donemde alarm kaydi bulunmuyor.', 50, yPosition + 25);
      return yPosition + 50;
    }
    
    let currentY = yPosition + 30;
    
    // ALARM TİPLERİ TABLOSU
    doc.fillColor(this.colors.primary)
       .rect(50, currentY, 512, 20)
       .fill();
    
    this.setupFonts(doc, 'bold');
    doc.fillColor('#ffffff')
       .fontSize(10)
       .text('ALARM TIPI', 60, currentY + 6)
       .text('SAYI', 400, currentY + 6)
       .text('ORAN', 480, currentY + 6);
    
    currentY += 25;
    
    const total = Object.values(alarmTypes).reduce((sum, count) => sum + count, 0);
    const sortedTypes = Object.entries(alarmTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedTypes.forEach(([type, count], index) => {
      const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.fillColor(rowColor)
         .rect(50, currentY - 5, 512, 20)
         .fill();
      
      const percentage = ((count / total) * 100).toFixed(1);
      
      // ALARM TİPİ
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(9)
         .text(type, 60, currentY);
      
      // SAYI
      this.setupFonts(doc, 'bold');
      doc.fillColor(this.colors.dark)
         .fontSize(9)
         .text(count.toString(), 400, currentY);
      
      // ORAN
      doc.fillColor(this.colors.info)
         .fontSize(9)
         .text(`%${percentage}`, 480, currentY);
      
      // GRAFİK ÇUBUĞU
      const barWidth = (percentage / 100) * 100;
      doc.fillColor(this.colors.info)
         .rect(250, currentY + 5, barWidth, 8)
         .fill();
      
      currentY += 20;
    });
    
    return currentY + 20;
  }

  // NESNE TİPLERİ
  createObjectTypes(doc, objectTypes, yPosition) {
    if (yPosition > 500) {
      doc.addPage();
      yPosition = 50;
    }
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('👁️ TESPIT EDILEN NESNELER', 50, yPosition);
    
    if (!objectTypes || Object.keys(objectTypes).length === 0) {
      this.setupFonts(doc, 'normal');
      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .text('Nesne tespit verisi bulunmuyor.', 50, yPosition + 25);
      return yPosition + 50;
    }
    
    let currentY = yPosition + 30;
    
    const total = Object.values(objectTypes).reduce((sum, count) => sum + count, 0);
    const sortedObjects = Object.entries(objectTypes)
      .sort(([,a], [,b]) => b - a);
    
    let x = 50;
    sortedObjects.forEach(([objectType, count], index) => {
      if (x > 400) {
        x = 50;
        currentY += 60;
      }
      
      const percentage = ((count / total) * 100).toFixed(1);
      
      // NESNE KUTUSU
      doc.fillColor('#f8f9fa')
         .rect(x, currentY, 100, 50)
         .fill()
         .strokeColor(this.colors.border)
         .rect(x, currentY, 100, 50)
         .stroke();
      
      // NESNE İSMİ
      this.setupFonts(doc, 'bold');
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(objectType.toUpperCase(), x + 5, currentY + 10, { width: 90, align: 'center' });
      
      // SAYI
      doc.fillColor(this.colors.primary)
         .fontSize(12)
         .text(count.toString(), x + 5, currentY + 25);
      
      // ORAN
      this.setupFonts(doc, 'normal');
      doc.fillColor('#7f8c8d')
         .fontSize(8)
         .text(`%${percentage}`, x + 25, currentY + 25);
      
      x += 110;
    });
    
    return currentY + 70;
  }

  // RİSK DAĞILIMI
  createRiskDistribution(doc, riskDistribution, yPosition) {
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('⚠️ RISK DAGILIMI', 50, yPosition);
    
    const risks = {
      HIGH: riskDistribution?.HIGH || 0,
      MEDIUM: riskDistribution?.MEDIUM || 0,
      LOW: riskDistribution?.LOW || 0
    };
    
    const total = Object.values(risks).reduce((sum, count) => sum + count, 0) || 1;
    
    let currentY = yPosition + 30;
    
    const riskLevels = [
      { level: 'YUKSEK RISK', count: risks.HIGH, color: this.colors.danger, icon: '🔴' },
      { level: 'ORTA RISK', count: risks.MEDIUM, color: this.colors.warning, icon: '🟡' },
      { level: 'DUSUK RISK', count: risks.LOW, color: this.colors.success, icon: '🟢' }
    ];
    
    riskLevels.forEach(risk => {
      const percentage = ((risk.count / total) * 100).toFixed(1);
      
      // RİSK SEVİYESİ
      doc.fillColor(risk.color)
         .fontSize(12)
         .text(risk.icon, 50, currentY);
      
      this.setupFonts(doc, 'bold');
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(risk.level, 70, currentY);
      
      // SAYI VE ORAN
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(`${risk.count} olay (%${percentage})`, 200, currentY);
      
      // GRAFİK ÇUBUĞU
      const barWidth = (percentage / 100) * 200;
      doc.fillColor(risk.color)
         .rect(300, currentY - 5, barWidth, 12)
         .fill();
      
      currentY += 25;
    });
    
    return currentY + 20;
  }

  // SAATLİK DAĞILIM
  createHourlyDistribution(doc, hourlyDistribution, yPosition) {
    if (yPosition > 400) {
      doc.addPage();
      yPosition = 50;
    }
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('🕐 SAATLIK ALARM DAGILIMI', 50, yPosition);
    
    if (!hourlyDistribution || hourlyDistribution.length === 0) {
      this.setupFonts(doc, 'normal');
      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .text('Saatlik dagilim verisi bulunmuyor.', 50, yPosition + 25);
      return yPosition + 50;
    }
    
    let currentY = yPosition + 30;
    
    // EN YOĞUN SAATLER
    const topHours = [...hourlyDistribution]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(11)
       .text('En Yogun Saatler:', 50, currentY);
    
    currentY += 20;
    
    topHours.forEach((hour, index) => {
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(`${index + 1}. ${hour.hour} - ${hour.count} alarm`, 70, currentY);
      
      currentY += 15;
    });
    
    return currentY + 30;
  }

  // SON ALARMLAR
  createRecentAlarms(doc, alarms, yPosition) {
    if (yPosition > 400) {
      doc.addPage();
      yPosition = 50;
    }
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('📋 SON ALARMLAR', 50, yPosition);
    
    if (!alarms || alarms.length === 0) {
      this.setupFonts(doc, 'normal');
      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .text('Son alarm kaydi bulunmuyor.', 50, yPosition + 25);
      return yPosition + 50;
    }
    
    let currentY = yPosition + 30;
    
    // TABLO BAŞLIKLARI
    doc.fillColor(this.colors.primary)
       .rect(50, currentY, 512, 20)
       .fill();
    
    this.setupFonts(doc, 'bold');
    doc.fillColor('#ffffff')
       .fontSize(9)
       .text('ZAMAN', 60, currentY + 6)
       .text('KAMERA', 120, currentY + 6)
       .text('TIP', 200, currentY + 6)
       .text('NESNE', 280, currentY + 6)
       .text('RISK', 360, currentY + 6)
       .text('DURUM', 440, currentY + 6);
    
    currentY += 25;
    
    alarms.slice(0, 15).forEach((alarm, index) => {
      const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.fillColor(rowColor)
         .rect(50, currentY - 5, 512, 20)
         .fill();
      
      const time = new Date(alarm.timestamp).toLocaleTimeString('tr-TR');
      const riskColor = alarm.riskLevel === 'HIGH' ? this.colors.danger :
                       alarm.riskLevel === 'MEDIUM' ? this.colors.warning : this.colors.success;
      const statusIcon = alarm.aiVerified ? '✅' : '⏳';
      
      // VERİLER
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(8)
         .text(time, 60, currentY)
         .text(`Kamera ${alarm.cameraId}`, 120, currentY)
         .text(alarm.type, 200, currentY)
         .text(alarm.objectType || '-', 280, currentY);
      
      // RİSK SEVİYESİ
      this.setupFonts(doc, 'bold');
      doc.fillColor(riskColor)
         .fontSize(8)
         .text(alarm.riskLevel, 360, currentY);
      
      // DURUM
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(statusIcon, 440, currentY - 2);
      
      currentY += 20;
    });
    
    return currentY + 20;
  }

  // HAFTALIK ÖZET
  createWeeklySummary(doc, reportData, yPosition) {
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(16)
       .text('📈 HAFTALIK PERFORMANS', 50, yPosition);
    
    const totalAlarms = reportData.totalAlarms || 0;
    const aiAccuracy = reportData.aiAccuracy || 0;
    
    let currentY = yPosition + 30;
    
    const metrics = [
      { label: 'TOPLAM ALARM', value: totalAlarms, color: this.colors.danger, icon: '🚨' },
      { label: 'AI DOGRULUK', value: '%' + aiAccuracy, color: this.colors.success, icon: '🤖' },
      { label: 'GUNLUK ORTALAMA', value: Math.round(totalAlarms / 7), color: this.colors.info, icon: '📊' },
      { label: 'TREND', value: this.getWeeklyTrend(reportData.dailyTrend), color: this.colors.warning, icon: '📈' }
    ];
    
    let x = 50;
    metrics.forEach(metric => {
      doc.fillColor(metric.color)
         .rect(x, currentY, 120, 60)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(14)
         .text(metric.icon, x + 10, currentY + 10)
         .fontSize(12);
      
      this.setupFonts(doc, 'bold');
      doc.text(metric.value.toString(), x + 35, currentY + 15)
         .fontSize(9);
      
      this.setupFonts(doc, 'normal');
      doc.text(metric.label, x + 10, currentY + 40, { width: 100, align: 'center' });
      
      x += 130;
    });
    
    return currentY + 80;
  }

  // GÜNLÜK TREND
  createDailyTrend(doc, dailyTrend, yPosition) {
    if (yPosition > 400) {
      doc.addPage();
      yPosition = 50;
    }
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('📅 GUNLUK TREND', 50, yPosition);
    
    let currentY = yPosition + 30;
    
    // TREND TABLOSU
    doc.fillColor(this.colors.primary)
       .rect(50, currentY, 512, 20)
       .fill();
    
    this.setupFonts(doc, 'bold');
    doc.fillColor('#ffffff')
       .fontSize(10)
       .text('TARIH', 60, currentY + 6)
       .text('TOPLAM', 150, currentY + 6)
       .text('DOGRULANAN', 250, currentY + 6)
       .text('YUKSEK RISK', 350, currentY + 6)
       .text('TREND', 450, currentY + 6);
    
    currentY += 25;
    
    dailyTrend.forEach((day, index) => {
      const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      doc.fillColor(rowColor)
         .rect(50, currentY - 5, 512, 20)
         .fill();
      
      const trend = this.getDayTrend(day, dailyTrend[index - 1]);
      
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(9)
         .text(this.formatDate(day.date), 60, currentY)
         .text(day.total.toString(), 150, currentY)
         .text(day.verified.toString(), 250, currentY)
         .text(day.highRisk.toString(), 350, currentY);
      
      doc.fillColor(trend.color)
         .fontSize(9)
         .text(trend.icon, 450, currentY);
      
      currentY += 20;
    });
    
    return currentY + 20;
  }

  // PERFORMANS ANALİZİ
  createPerformanceAnalysis(doc, reportData, yPosition) {
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(14)
       .text('🎯 PERFORMANS ANALIZI', 50, yPosition);
    
    let currentY = yPosition + 30;
    
    const analysis = this.getWeeklyAnalysis(reportData);
    
    this.setupFonts(doc, 'bold');
    doc.fillColor(this.colors.dark)
       .fontSize(11)
       .text('Haftalik Degerlendirme:', 50, currentY);
    
    currentY += 20;
    
    analysis.points.forEach(point => {
      doc.fillColor(point.color)
         .fontSize(12)
         .text('•', 50, currentY);
      
      this.setupFonts(doc, 'normal');
      doc.fillColor(this.colors.dark)
         .fontSize(10)
         .text(point.text, 65, currentY, { width: 450 });
      
      currentY += 15;
    });
    
    return currentY + 30;
  }

  // ALT BİLGİ
  createFooter(doc, reportType) {
    const pageHeight = 792;
    
    this.setupFonts(doc, 'normal');
    doc.fillColor('#95a5a6')
       .fontSize(8)
       .text(`GUVENLIK SISTEMI - ${reportType}`, 50, pageHeight - 40, { align: 'left' })
       .text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, 300, pageHeight - 40, { align: 'center' })
       .text('Sayfa 1 / 1', 500, pageHeight - 40, { align: 'right' });
  }

  // YARDIMCI FONKSİYONLAR
  getWeeklyTrend(dailyTrend) {
    if (!dailyTrend || dailyTrend.length < 2) return '→';
    
    const firstDay = dailyTrend[0].total;
    const lastDay = dailyTrend[dailyTrend.length - 1].total;
    
    if (lastDay > firstDay + 2) return '↗️';
    if (lastDay < firstDay - 2) return '↘️';
    return '→';
  }

  getDayTrend(day, previousDay) {
    if (!previousDay) return { icon: '→', color: this.colors.info };
    
    const diff = day.total - previousDay.total;
    if (diff > 2) return { icon: '↗️', color: this.colors.danger };
    if (diff < -2) return { icon: '↘️', color: this.colors.success };
    return { icon: '→', color: this.colors.info };
  }

  formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}`;
  }

  getWeeklyAnalysis(reportData) {
    const totalAlarms = reportData.totalAlarms || 0;
    const avgDaily = totalAlarms / 7;
    const accuracy = reportData.aiAccuracy || 0;
    
    const points = [];
    
    // DURUM NOKTALARI
    if (avgDaily > 15) {
      points.push({
        text: 'Yuksek alarm yogunlugu - ek guvenlik onlemleri gerekli',
        color: this.colors.danger
      });
    } else if (avgDaily > 8) {
      points.push({
        text: 'Orta seviye alarm aktivitesi - normal izleme yeterli',
        color: this.colors.warning
      });
    } else {
      points.push({
        text: 'Dusuk alarm aktivitesi - standart guvenlik yeterli',
        color: this.colors.success
      });
    }
    
    // AI PERFORMANSI
    if (accuracy > 85) {
      points.push({
        text: 'Yapay zeka dogruluk orani mukemmel seviyede',
        color: this.colors.success
      });
    } else if (accuracy > 70) {
      points.push({
        text: 'Yapay zeka dogruluk orani iyi seviyede',
        color: this.colors.info
      });
    } else {
      points.push({
        text: 'Yapay zeka dogruluk orani gelistirilmeli',
        color: this.colors.warning
      });
    }
    
    return { points };
  }

  createEmergencyPDF(doc) {
    this.setupFonts(doc, 'bold');
    doc.fontSize(16)
       .text('GUVENLIK RAPORU', 50, 50);
    
    this.setupFonts(doc, 'normal');
    doc.fontSize(12)
       .text('Teknik bir sorun olustu. Lutfen daha sonra tekrar deneyin.', 50, 80)
       .text(`Olusturulma: ${new Date().toLocaleString('tr-TR')}`, 50, 100);
  }
}

module.exports = new PDFGenerator();