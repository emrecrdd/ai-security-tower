import React from 'react';
import { useAlarms } from '../hooks/useAlarms';

const AlarmPanel = () => {
  const { alarms, loading, error, deleteAlarm } = useAlarms();

  if (loading) {
    return (
      <div className="alarm-panel loading">
        <div className="loading-spinner">⏳</div>
        <p>Alarmlar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alarm-panel error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="alarm-panel">
      <div className="panel-header">
        <h2>🚨 Alarm Paneli</h2>
        <span className="alarm-count">{alarms.length} alarm</span>
      </div>

      <div className="alarms-list">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="alarm-item">
            <div className="alarm-content">
              <div className="alarm-type">{alarm.type}</div>
              <div className="alarm-meta">
                <span className="camera-id">Kamera #{alarm.cameraId}</span>
                <span className="alarm-time">
                  {new Date(alarm.timestamp).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
            <button
              onClick={() => deleteAlarm(alarm.id)}
              className="delete-alarm-btn"
              title="Alarmı sil"
            >
              ✕
            </button>
          </div>
        ))}

        {alarms.length === 0 && (
          <div className="no-alarms">
            <div className="no-alarms-icon">🎉</div>
            <p>Henüz alarm yok</p>
            <small>Sistem aktif ve izlemede</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmPanel;