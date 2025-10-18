import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const StatusIndicator = () => {
  const { isConnected } = useWebSocket();

  return (
    <div className="status-indicator">
      <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢' : '🔴'}
      </div>
      <span className="status-text">
        {isConnected ? 'Yapay Zeka Bağlantısı Veri Transferi Yapılıyor' : 'Yapay Zeka Bağlantısı Yok'}
      </span>
    </div>
  );
};

export default StatusIndicator;