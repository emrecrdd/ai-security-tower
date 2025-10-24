import React, { useState, useEffect } from 'react';
import AlarmPanel from '../components/AlarmPanel';
import LogTable from '../components/LogTable';
import VideoFeed from '../components/VideoFeed';
import StatusIndicator from '../components/StatusIndicator';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Canlı saat - saniyede bir güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock kamera verileri - backend'den gelecek
  const mockCameras = [
    { id: 1, name: 'Ön Giriş Kamerası', location: 'Ana Giriş', ip: '192.168.1.100' },
    { id: 2, name: 'Arka Bahçe', location: 'Bahçe', ip: '192.168.1.101' },
    { id: 3, name: 'Garaj', location: 'Garaj Girişi', ip: '192.168.1.102' },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏰 Security Tower</h1>
          <p>Gerçek zamanlı güvenlik izleme sistemi</p>
        </div>
        <div className="header-right">
          <StatusIndicator />
          <div className="system-time">
            {currentTime.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Genel Bakış
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cameras' ? 'active' : ''}`}
          onClick={() => setActiveTab('cameras')}
        >
          📹 Kameralar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Alarm Logları
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-main">
              <AlarmPanel />
            </div>
            <div className="overview-sidebar">
              <div className="quick-stats">
                <h3>📈 Sistem Durumu</h3>
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="stat-value">{mockCameras.length}</div>
                    <div className="stat-label">Aktif Kamera</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">7/24</div>
                    <div className="stat-label">Çalışma Süresi</div>
                  </div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3> ALARM ANALİTİK MERKEZİ</h3>
                <LogTable />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cameras' && (
          <div className="cameras-grid">
            <h2>📹 Kamera Görüntüleri</h2>
            <div className="cameras-container">
              {mockCameras.map(camera => (
                <VideoFeed
                  key={camera.id}
                  cameraId={camera.id}
                  cameraName={camera.name}
streamUrl={`${process.env.REACT_APP_BACKEND_URL.replace('/api','')}/video/${camera.id}`}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-view">
            <h2>📋 Detaylı Alarm Logları</h2>
            <LogTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
