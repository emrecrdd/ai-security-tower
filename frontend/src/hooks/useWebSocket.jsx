import { useEffect, useState } from 'react';
import { connectSocket } from '../services/socket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlarm, setLastAlarm] = useState(null);

  useEffect(() => {
    const cleanup = connectSocket({
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onNewAlarm: (alarm) => setLastAlarm(alarm),
    });

    return cleanup;
  }, []);

  return {
    isConnected,
    lastAlarm,
  };
};