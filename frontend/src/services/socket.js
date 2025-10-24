import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL; // <-- Burada process.env kullan

export const socket = io(SOCKET_URL);

export const connectSocket = (callbacks = {}) => {
  socket.on('connect', () => {
    console.log('🟢 Socket.IO bağlantısı kuruldu');
    callbacks.onConnect?.();
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket.IO bağlantısı kesildi');
    callbacks.onDisconnect?.();
  });

  socket.on('newAlarm', (alarm) => {
    console.log('🚨 Yeni alarm geldi:', alarm);
    callbacks.onNewAlarm?.(alarm);
  });

  return () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('newAlarm');
  };
};
