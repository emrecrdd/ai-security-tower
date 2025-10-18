import { useState, useEffect } from 'react';
import { alarmAPI } from '../services/api';
import { connectSocket } from '../services/socket';

export const useAlarms = () => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const response = await alarmAPI.getAll();
      setAlarms(response.data);
      setError(null);
    } catch (err) {
      setError('Alarmlar yüklenemedi');
      console.error('Alarm fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAlarm = async (alarmData) => {
    try {
      const response = await alarmAPI.create(alarmData);
      return response.data;
    } catch (err) {
      setError('Alarm oluşturulamadı');
      throw err;
    }
  };

  const deleteAlarm = async (id) => {
    try {
      await alarmAPI.delete(id);
      setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    } catch (err) {
      setError('Alarm silinemedi');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlarms();

    const cleanup = connectSocket({
      onNewAlarm: (newAlarm) => {
        setAlarms(prev => [newAlarm, ...prev]);
      }
    });

    return cleanup;
  }, []);

  return {
    alarms,
    loading,
    error,
    fetchAlarms,
    createAlarm,
    deleteAlarm,
  };
};