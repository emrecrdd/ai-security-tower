import React from 'react';
import { useAlarms } from '../hooks/useAlarms';

const LogTable = () => {
  const { alarms, deleteAlarm } = useAlarms();

  const getAlarmTypeColor = (type) => {
    const colors = {
      'Hareket Tespiti': '#ff6b6b',
      'Yüz Tanıma': '#4ecdc4',
      'Nesne Tespiti': '#ffd166',
      'Bölge İhlali': '#ff9ff3',
    };
    return colors[type] || '#74b9ff';
  };

  return (
    <div className="log-table">
      <div className="table-header">
        <h3>📊 Alarm Logları</h3>
        <span className="table-count">{alarms.length} kayıt</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tip</th>
              <th>Kamera</th>
              <th>Zaman</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr key={alarm.id}>
                <td className="alarm-id">#{alarm.id}</td>
                <td>
                  <span 
                    className="alarm-type-badge"
                    style={{ backgroundColor: getAlarmTypeColor(alarm.type) }}
                  >
                    {alarm.type}
                  </span>
                </td>
                <td className="camera-cell">Kamera {alarm.cameraId}</td>
                <td className="time-cell">
                  {new Date(alarm.timestamp).toLocaleString('tr-TR')}
                </td>
                <td>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="table-delete-btn"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {alarms.length === 0 && (
          <div className="empty-table">
            <p>Henüz alarm kaydı bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogTable;