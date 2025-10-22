import React, { useState, useMemo } from 'react';
import { useAlarms } from '../hooks/useAlarms';

const LogTable = () => {
  const { alarms, deleteAlarm } = useAlarms();
  const [filter, setFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('TODAY');

  // 🎯 ANALİTİK: Filtreleme ve İstatistikler
  const filteredAlarms = useMemo(() => {
    let filtered = alarms;
    
    // Risk Filtresi
    if (filter !== 'ALL') {
      filtered = filtered.filter(alarm => alarm.riskLevel === filter);
    }
    
    // Tarih Filtresi
    const now = new Date();
    switch (dateRange) {
      case 'TODAY':
        filtered = filtered.filter(alarm => 
          new Date(alarm.timestamp).toDateString() === now.toDateString()
        );
        break;
      case 'WEEK':
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(alarm => new Date(alarm.timestamp) > weekAgo);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [alarms, filter, dateRange]);

  // İstatistikler
  const stats = useMemo(() => ({
    total: alarms.length,
    highRisk: alarms.filter(a => a.riskLevel === 'HIGH').length,
    mediumRisk: alarms.filter(a => a.riskLevel === 'MEDIUM').length,
    today: alarms.filter(a => 
      new Date(a.timestamp).toDateString() === new Date().toDateString()
    ).length
  }), [alarms]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return '#ff4d4f';
      case 'MEDIUM': return '#faad14';
      default: return '#52c41a';
    }
  };

  const exportToCSV = () => {
    // CSV export functionality
    console.log('Exporting to CSV:', filteredAlarms);
    alert('CSV dışa aktarıldı!');
  };

  return (
    <div className="log-table analytics-panel">
      <div className="panel-header">
       
        {/* İstatistik Kartları */}
     
<div style={{
  display: 'flex',
  gap: '12px',
  margin: '20px 0',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: 'nowrap'
}}>
  {/* Toplam Alarm */}
  <div style={{
    flex: 1,
    minWidth: '120px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '4px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      lineHeight: 1,
      color: 'white'
    }}>{stats.total}</div>
    <div style={{
      fontSize: '11px',
      fontWeight: '600',
      opacity: '0.9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: '1.2',
      color: 'white'
    }}>Toplam Alarm</div>
  </div>

  {/* Yüksek Risk */}
  <div style={{
    flex: 1,
    minWidth: '120px',
    background: 'linear-gradient(135deg, rgba(255, 77, 79, 0.3), rgba(255, 77, 79, 0.15))',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 77, 79, 0.4)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '4px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      lineHeight: 1,
      color: 'white'
    }}>{stats.highRisk}</div>
    <div style={{
      fontSize: '11px',
      fontWeight: '600',
      opacity: '0.9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: '1.2',
      color: 'white'
    }}>Yüksek Risk</div>
  </div>

  {/* Orta Risk */}
  <div style={{
    flex: 1,
    minWidth: '120px',
    background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.3), rgba(250, 173, 20, 0.15))',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(250, 173, 20, 0.4)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '4px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      lineHeight: 1,
      color: 'white'
    }}>{stats.mediumRisk}</div>
    <div style={{
      fontSize: '11px',
      fontWeight: '600',
      opacity: '0.9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: '1.2',
      color: 'white'
    }}>Orta Risk</div>
  </div>

  {/* Bugün */}
  <div style={{
    flex: 1,
    minWidth: '120px',
    background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.3), rgba(82, 196, 26, 0.15))',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(82, 196, 26, 0.4)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '4px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      lineHeight: 1,
      color: 'white'
    }}>{stats.today}</div>
    <div style={{
      fontSize: '11px',
      fontWeight: '600',
      opacity: '0.9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: '1.2',
      color: 'white'
    }}>Bugün</div>
  </div>
</div>

        {/* Filtreler */}
        <div className="table-filters">
          <div className="filter-group">
            <label>Risk Seviyesi:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Tümü</option>
              <option value="HIGH">Yüksek Risk</option>
              <option value="MEDIUM">Orta Risk</option>
              <option value="LOW">Düşük Risk</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Zaman Aralığı:</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Tüm Zamanlar</option>
              <option value="TODAY">Bugün</option>
              <option value="WEEK">Son 7 Gün</option>
            </select>
          </div>

          <div className="filter-info">
            {filteredAlarms.length} kayıt görüntüleniyor
          </div>
        </div>
      </div>

      {/* 🎯 TABLO CONTAINER FIX - SCROLL EKLENDİ */}
      <div className="table-container-wrapper">
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tür</th>
                <th>Nesne</th>
                <th>Kamera</th>
                <th>Zaman</th>
                <th>Güven</th>
                <th>Risk</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlarms.map((alarm) => (
                <tr key={alarm.id} className={`risk-${alarm.riskLevel.toLowerCase()}`}>
                  <td className="alarm-id">#{alarm.id}</td>
                  <td className="alarm-type">
                    <span className="type-icon">
                      {alarm.type === 'İNSAN_TESPİTİ' ? '👤' : 
                       alarm.type === 'ARAÇ_TESPİTİ' ? '🚗' : '🎥'}
                    </span>
                    {alarm.type}
                  </td>
                  <td className="object-type">{alarm.objectType || '-'}</td>
                  <td className="camera-id">
                    <span className="camera-badge">Kamera {alarm.cameraId}</span>
                  </td>
                  <td className="timestamp">
                    {new Date(alarm.timestamp).toLocaleString('tr-TR')}
                  </td>
                  <td className="confidence">
                    <div className="confidence-cell">
                      <div className="confidence-value">%{(alarm.confidence * 100).toFixed(1)}</div>
                      <div className="confidence-bar-small">
                        <div 
                          className="confidence-fill" 
                          style={{width: `${alarm.confidence * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="risk-level">
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(alarm.riskLevel) }}
                    >
                      {alarm.riskLevel}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => deleteAlarm(alarm.id)} 
                      className="action-btn delete"
                      title="Kaydı sil"
                    >
                      🗑️ Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAlarms.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Filtrelere uygun alarm bulunamadı</h3>
              <p>Filtreleri değiştirmeyi deneyin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogTable;