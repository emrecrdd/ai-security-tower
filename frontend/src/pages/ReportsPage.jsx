// frontend/src/pages/ReportsPage.jsx - GRAFİKLİ VERSİYON
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './ReportsPage.css';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportsPage = () => {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [customRange, setCustomRange] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);

const API_BASE = process.env.REACT_APP_BACKEND_URL;

  // İstatistik verilerini çek
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        prepareChartData(data);
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  // Grafik verilerini hazırla
  const prepareChartData = (statsData) => {
    if (!statsData) return;

    // 1. Alarm Tipi Dağılımı - Doughnut Chart
    const alarmTypesData = {
      labels: Object.keys(statsData.alarmTypes || {}),
      datasets: [
        {
          data: Object.values(statsData.alarmTypes || {}),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };

    // 2. Günlük Trend - Line Chart
    const dailyTrendData = {
      labels: statsData.dailyTrend?.map(day => day.date) || [],
      datasets: [
        {
          label: 'Toplam Alarm',
          data: statsData.dailyTrend?.map(day => day.total) || [],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Yüksek Risk',
          data: statsData.dailyTrend?.map(day => day.highRisk) || [],
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    // 3. Saatlik Dağılım - Bar Chart
    const hourlyData = {
      labels: statsData.hourlyDistribution?.map(hour => hour.hour) || [],
      datasets: [
        {
          label: 'Alarm Sayısı',
          data: statsData.hourlyDistribution?.map(hour => hour.count) || [],
          backgroundColor: 'rgba(155, 89, 182, 0.7)',
          borderColor: 'rgba(155, 89, 182, 1)',
          borderWidth: 1
        }
      ]
    };

    // 4. Risk Dağılımı - Bar Chart
    const riskData = {
      labels: ['Yüksek Risk', 'Orta Risk', 'Düşük Risk'],
      datasets: [
        {
          label: 'Risk Dağılımı',
          data: [
            statsData.riskDistribution?.HIGH || 0,
            statsData.riskDistribution?.MEDIUM || 0,
            statsData.riskDistribution?.LOW || 0
          ],
          backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
          borderWidth: 0
        }
      ]
    };

    setChartData({
      alarmTypes: alarmTypesData,
      dailyTrend: dailyTrendData,
      hourlyDistribution: hourlyData,
      riskDistribution: riskData
    });
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Güvenlik İstatistikleri'
      }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'bottom'
      }
    }
  };

  // Mevcut raporları listele
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reports/list`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Rapor listesi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const handleExportPDF = async (reportType = 'daily') => {
    setExporting(true);
    
    try {
      console.log('🎯 PDF oluşturuluyor:', reportType);

      let url;
      let params = new URLSearchParams();

      if (reportType === 'daily') {
        url = `${API_BASE}/reports/pdf/daily`;
        params.append('date', selectedDate);
      } else if (reportType === 'weekly') {
        url = `${API_BASE}/reports/pdf/weekly`;
        if (customRange) {
          params.append('startDate', dateRange.start);
          params.append('endDate', dateRange.end);
        }
      } else if (reportType === 'test') {
        url = `${API_BASE}/reports/pdf/test`;
      }
      
      const fullUrl = `${url}?${params.toString()}`;
      console.log('📄 URL:', fullUrl);

      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `PDF oluşturulamadı: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ PDF sonucu:', result);

      if (result.success && result.filename) {
        const downloadUrl = `${API_BASE}/reports/download/${result.filename}`;
        window.open(downloadUrl, '_blank');
        
        // Listeyi güncelle
        setTimeout(fetchReports, 1000);
      } else {
        throw new Error(result.error || 'PDF oluşturulamadı');
      }
      
    } catch (error) {
      console.error('❌ PDF hatası:', error);
      alert('PDF oluşturulamadı: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteReport = async (filename) => {
    if (!window.confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reports/delete/${filename}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Rapor başarıyla silindi!');
        fetchReports();
      } else {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Rapor silinemedi: ' + error.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (filename) => {
    const match = filename.match(/(\d+)/);
    if (match) {
      const timestamp = parseInt(match[1]);
      return new Date(timestamp).toLocaleString('tr-TR');
    }
    return filename;
  };

  const getReportType = (filename) => {
    if (filename.includes('gunluk')) return 'Günlük Rapor';
    if (filename.includes('haftalik')) return 'Haftalık Rapor';
    if (filename.includes('test')) return 'Test Raporu';
    return 'Rapor';
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>📊 Güvenlik Raporları</h1>
        <p>Sistem aktivitelerini ve güvenlik olaylarını takip edin</p>
      </div>

      {/* GERÇEK ZAMANLI İSTATİSTİKLER */}
      {stats && (
        <div className="live-stats-section">
          <h2>📈 Gerçek Zamanlı İstatistikler</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-value">{stats.totalAlarms || 0}</div>
              <div className="stat-label">Toplam Alarm</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🤖</div>
              <div className="stat-value">%{stats.aiAccuracy?.toFixed(1) || 0}</div>
              <div className="stat-label">AI Doğruluk</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-value">{stats.highRiskAlarms || 0}</div>
              <div className="stat-label">Yüksek Risk</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value">{stats.dailyAverage || 0}</div>
              <div className="stat-label">Günlük Ortalama</div>
            </div>
          </div>
        </div>
      )}

      {/* DİNAMİK GRAFİKLER */}
      {chartData && (
        <div className="charts-section">
          <h2>📊 Detaylı Analizler</h2>
          <div className="charts-grid">
            {/* Alarm Tipi Dağılımı */}
            <div className="chart-card">
              <h3>🔔 Alarm Tipi Dağılımı</h3>
              <div className="chart-container">
                <Doughnut 
                  data={chartData.alarmTypes} 
                  options={doughnutOptions} 
                />
              </div>
            </div>

            {/* Günlük Trend */}
            <div className="chart-card">
              <h3>📈 Günlük Alarm Trendi</h3>
              <div className="chart-container">
                <Line 
                  data={chartData.dailyTrend} 
                  options={chartOptions} 
                />
              </div>
            </div>

            {/* Saatlik Dağılım */}
            <div className="chart-card">
              <h3>🕐 Saatlik Dağılım</h3>
              <div className="chart-container">
                <Bar 
                  data={chartData.hourlyDistribution} 
                  options={chartOptions} 
                />
              </div>
            </div>

            {/* Risk Dağılımı */}
            <div className="chart-card">
              <h3>⚠️ Risk Dağılımı</h3>
              <div className="chart-container">
                <Bar 
                  data={chartData.riskDistribution} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAPOR OLUŞTURMA BÖLÜMÜ */}
      <div className="report-creation-section">
        <h2>📄 Yeni Rapor Oluştur</h2>
        
        <div className="report-actions">
          {/* GÜNLÜK RAPOR */}
          <div className="report-card">
            <div className="report-header">
              <span className="report-icon">📅</span>
              <h3>Günlük Rapor</h3>
            </div>
            <p>Son 24 saat içindeki güvenlik aktiviteleri</p>
            
            <div className="date-selector">
              <label>Tarih:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => handleExportPDF('daily')}
              disabled={exporting}
            >
              {exporting ? '⏳ Oluşturuluyor...' : '📥 Günlük PDF İndir'}
            </button>
          </div>

          {/* HAFTALIK RAPOR */}
          <div className="report-card">
            <div className="report-header">
              <span className="report-icon">📊</span>
              <h3>Haftalık Rapor</h3>
            </div>
            <p>Haftalık performans analizi ve trendler</p>
            
            <div className="range-selector">
              <label>
                <input 
                  type="checkbox" 
                  checked={customRange}
                  onChange={(e) => setCustomRange(e.target.checked)}
                />
                Özel tarih aralığı
              </label>
              
              {customRange && (
                <div className="date-range">
                  <div>
                    <label>Başlangıç:</label>
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label>Bitiş:</label>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={() => handleExportPDF('weekly')}
              disabled={exporting}
            >
              {exporting ? '⏳ Oluşturuluyor...' : '📈 Haftalık PDF İndir'}
            </button>
          </div>

          {/* TEST RAPORU */}
          <div className="report-card">
            <div className="report-header">
              <span className="report-icon">🧪</span>
              <h3>Test Raporu</h3>
            </div>
            <p>PDF oluşturma sistemini test etmek için</p>
            
            <button 
              className="btn btn-test"
              onClick={() => handleExportPDF('test')}
              disabled={exporting}
            >
              {exporting ? '⏳ Oluşturuluyor...' : '🔧 Test PDF İndir'}
            </button>
          </div>
        </div>
      </div>

      {/* MEVCUT RAPORLAR LİSTESİ */}
      <div className="reports-list-section">
        <div className="section-header">
          <h2>📁 Mevcut Raporlar</h2>
          <button 
            className="btn btn-refresh"
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? '🔄' : '🔄 Yenile'}
          </button>
        </div>

        {loading ? (
          <div className="loading">Raporlar yükleniyor...</div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>📭 Henüz hiç rapor oluşturulmamış</p>
            <small>Yukarıdaki butonlardan ilk raporunuzu oluşturun</small>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report, index) => (
              <div key={index} className="report-item">
                <div className="report-info">
                  <div className="report-type">{getReportType(report.filename)}</div>
                  <div className="report-date">{formatDate(report.filename)}</div>
                  <div className="report-size">{formatFileSize(report.size)}</div>
                </div>
                <div className="report-actions">
                  <button 
                    className="btn btn-download"
                    onClick={() => window.open(`${API_BASE}/reports/download/${report.filename}`, '_blank')}
                  >
                    📥 İndir
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteReport(report.filename)}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
