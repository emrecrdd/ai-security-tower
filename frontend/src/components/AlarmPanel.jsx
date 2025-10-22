import React from 'react';
import { useAlarms } from '../hooks/useAlarms';
import './AlarmPanel.css';

const AlarmPanel = () => {
  const { alarms, loading, error, deleteAlarm, markAsVerified } = useAlarms();

  // 🎯 CRITICAL: Sadece son 10 dakika + HIGH/MEDIUM risk + doğrulanmamış
  const urgentAlarms = alarms
    .filter(alarm => {
      const alarmTime = new Date(alarm.timestamp);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      return alarmTime > tenMinutesAgo && 
             alarm.riskLevel !== 'LOW' && 
             !alarm.verified;
    })
    .slice(0, 8); // Maksimum 8 kritik alarm

  if (loading) return (
    <div className="alarm-panel loading">
      <div className="loading-spinner">🔍</div>
      <p>Kritik alarmlar taranıyor...</p>
    </div>
  );

  if (error) return (
    <div className="alarm-panel error">
      <div className="error-icon">🚨</div>
      <p>Sistem bağlantı hatası</p>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Sistemi Yenile
      </button>
    </div>
  );

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'HIGH': return '🔥';
      case 'MEDIUM': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getAlarmIcon = (type) => {
    switch (type) {
      case 'İNSAN_TESPİTİ': return '👤';
      case 'ARAÇ_TESPİTİ': return '🚗';
      case 'HAREKET_TESPİTİ': return '🎥';
      default: return '🚨';
    }
  };

  return (
    <div className="alarm-panel command-center">
      <div className="panel-header">
        <div className="header-title">
          <h2> KRİTİK ALARM MERKEZİ</h2>
          <div className="live-indicator">
            <span className="pulse"></span>
            CANLI
          </div>
        </div>
        <div className="header-stats">
          <span className="urgent-count">{urgentAlarms.length} KRİTİK</span>
          <span className="total-count">{alarms.length} TOPLAM</span>
        </div>
      </div>

      <div className="alarms-list critical-alarms">
        {urgentAlarms.map((alarm) => (
          <div key={alarm.id} className={`alarm-item critical ${alarm.riskLevel.toLowerCase()}`}>
            <div className="alarm-indicator">
              <div className="alarm-icon">{getAlarmIcon(alarm.type)}</div>
              <div className="risk-badge">{getRiskIcon(alarm.riskLevel)}</div>
            </div>
            
            <div className="alarm-content">
              <div className="alarm-main">
                <div className="alarm-type">
                  <strong>{alarm.type}</strong>
                  <span className="object-type">{alarm.objectType || 'Tanımlanmayan Nesne'}</span>
                </div>
                <div className="alarm-confidence">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{width: `${alarm.confidence * 100}%`}}
                    ></div>
                  </div>
                  <span className="confidence-value">%{(alarm.confidence * 100).toFixed(0)}</span>
                </div>
              </div>
              
              <div className="alarm-meta">
                <div className="meta-left">
                  <span className="camera-badge">📹 Kamera {alarm.cameraId}</span>
                  <span className="time-ago">{new Date(alarm.timestamp).toLocaleTimeString('tr-TR')}</span>
                </div>
                <div className="meta-right">
                  {!alarm.verified && (
                    <button 
                      onClick={() => markAsVerified(alarm.id)}
                      className="verify-btn"
                      title="Alarmı doğrula"
                    >
                      ✅ Doğrula
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAlarm(alarm.id)} 
                    className="dismiss-btn"
                    title="Alarmı kapat"
                  >
                    ✕ Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {urgentAlarms.length === 0 && (
          <div className="no-critical-alarms">
            <div className="status-ok">✅</div>
            <div className="status-message">
              <h3>Tüm Sistemler Normal</h3>
              <p>Kritik alarm bulunmuyor</p>
            </div>
          </div>
        )}
      </div>

      {/* Sistem Durum Bilgisi */}
      <div className="system-status">
        <div className="status-item">
          <span className="status-dot active"></span>
          <span>AI Analiz: Aktif</span>
        </div>
        <div className="status-item">
          <span className="status-dot active"></span>
          <span>Kamera Bağlantıları: {alarms.filter(a => a.cameraId).length}/3</span>
        </div>
      </div>
    </div>
  );
};

export default AlarmPanel;