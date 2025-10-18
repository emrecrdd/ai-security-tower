import React, { useState } from 'react';
import StatusIndicator from '../components/StatusIndicator';

const Settings = () => {
  const [settings, setSettings] = useState({
    aiSensitivity: 75,
    autoDeleteAlarms: true,
    alarmSound: true,
    notifications: true,
    retentionDays: 30,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Sistem Ayarları</h1>
        <StatusIndicator />
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>🤖 AI ve Algılama Ayarları</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>AI Hassasiyet Seviyesi</span>
              <span className="setting-value">{settings.aiSensitivity}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.aiSensitivity}
              onChange={(e) => handleSettingChange('aiSensitivity', parseInt(e.target.value))}
              className="slider"
            />
            <div className="setting-description">
              Düşük: Daha az alarm, Yüksek: Daha fazla alarm
            </div>
          </div>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoDeleteAlarms}
                onChange={(e) => handleSettingChange('autoDeleteAlarms', e.target.checked)}
              />
              <span className="checkmark"></span>
              Alarmları otomatik temizle (30 gün sonra)
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>🔔 Bildirim Ayarları</h3>
          
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.alarmSound}
                onChange={(e) => handleSettingChange('alarmSound', e.target.checked)}
              />
              <span className="checkmark"></span>
              Alarm sesi çal
            </label>
          </div>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="checkmark"></span>
              Anlık bildirim göster
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>💾 Veri Yönetimi</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <span>Veri Saklama Süresi</span>
              <span className="setting-value">{settings.retentionDays} gün</span>
            </label>
            <select
              value={settings.retentionDays}
              onChange={(e) => handleSettingChange('retentionDays', parseInt(e.target.value))}
              className="setting-select"
            >
              <option value={7}>7 gün</option>
              <option value={30}>30 gün</option>
              <option value={90}>90 gün</option>
              <option value={365}>1 yıl</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-primary">
            ✅ Ayarları Kaydet
          </button>
          <button className="btn-secondary">
            🔄 Varsayılana Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;