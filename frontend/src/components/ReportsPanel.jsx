// frontend/src/components/ReportsPanel.js - DÜZELTİLMİŞ
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportsPanel.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL; // env destekli

const ReportsPanel = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/reports/${activeTab}`); // URL'Yİ GÜNCELLE
      setReportData(response.data);
    } catch (error) {
      console.error('Rapor yükleme hatası:', error);
      // Hata durumunda default data set et
      setReportData({
        summary: {
          totalAlarms: 0,
          aiVerifiedAlarms: 0,
          riskDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
          hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({ 
            hour: `${i}:00`, 
            count: 0 
          }))
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-panel loading">
        <div className="loading-spinner">📊</div>
        <p>Rapor yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="reports-panel">
      <div className="reports-header">
        <h2>📈 Güvenlik Raporları</h2>
        <div className="report-tabs">
          <button 
            className={activeTab === 'daily' ? 'active' : ''}
            onClick={() => setActiveTab('daily')}
          >
            Günlük
          </button>
          <button 
            className={activeTab === 'weekly' ? 'active' : ''}
            onClick={() => setActiveTab('weekly')}
          >
            Haftalık
          </button>
        </div>
      </div>

      <div className="report-content">
        {activeTab === 'daily' && <DailyReport data={reportData} />}
        {activeTab === 'weekly' && <WeeklyReport data={reportData} />}
      </div>
    </div>
  );
};

// Günlük Rapor Bileşeni - DÜZELTİLMİŞ
const DailyReport = ({ data }) => {
  // Null check ekleyelim
  if (!data || !data.summary) {
    return (
      <div className="daily-report">
        <div className="error-message">
          📊 Rapor verisi yüklenemedi
        </div>
      </div>
    );
  }

  const { summary } = data;
  const maxHourlyCount = Math.max(...summary.hourlyDistribution.map(h => h.count || 0), 1);

  return (
    <div className="daily-report">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{summary.totalAlarms || 0}</div>
          <div className="stat-label">Toplam Alarm</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.aiVerifiedAlarms || 0}</div>
          <div className="stat-label">AI Doğrulandı</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.riskDistribution?.HIGH || 0}</div>
          <div className="stat-label">Yüksek Risk</div>
        </div>
      </div>

      <div className="report-charts">
        <div className="chart-section">
          <h4>⏰ Saatlik Dağılım</h4>
          <div className="hourly-bars">
            {summary.hourlyDistribution.map((hour, index) => (
              <div key={index} className="hour-bar">
                <div 
                  className="bar-fill" 
                  style={{ 
                    height: `${((hour.count || 0) / maxHourlyCount) * 100}%` 
                  }}
                ></div>
                <span className="hour-label">{hour.hour}</span>
                <span className="hour-count">{hour.count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Haftalık Rapor Bileşeni - DÜZELTİLMİŞ
const WeeklyReport = ({ data }) => {
  if (!data) {
    return (
      <div className="weekly-report">
        <div className="error-message">
          📊 Haftalık rapor verisi yüklenemedi
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...(data.dailyTrend || []).map(d => d.total || 0), 1);
  const maxHighRisk = Math.max(...(data.dailyTrend || []).map(d => d.highRisk || 0), 1);

  return (
    <div className="weekly-report">
      <div className="trend-header">
        <h3>📅 Son 7 Gün Trendi</h3>
        <div className="trend-stats">
          <span>Toplam: {data.totalAlarms || 0} alarm</span>
          <span>AI Doğruluğu: %{data.aiAccuracy || 0}</span>
        </div>
      </div>

      <div className="trend-chart">
        {(data.dailyTrend || []).map((day, index) => (
          <div key={index} className="trend-day">
            <div className="day-label">
              {day.date ? new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' }) : '???'}
            </div>
            <div className="day-bars">
              <div 
                className="bar total" 
                style={{ height: `${((day.total || 0) / maxTotal) * 80}px` }}
                title={`Toplam: ${day.total || 0}`}
              ></div>
              <div 
                className="bar high-risk" 
                style={{ height: `${((day.highRisk || 0) / maxHighRisk) * 80}px` }}
                title={`Yüksek Risk: ${day.highRisk || 0}`}
              ></div>
            </div>
            <div className="day-date">{day.date ? day.date.split('-')[2] : '?'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPanel;
