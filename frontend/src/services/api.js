import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Alarm endpoints
export const alarmAPI = {
  getAll: () => api.get('/alarms'),
  getById: (id) => api.get(`/alarms/${id}`),
  create: (alarmData) => api.post('/alarms', alarmData),
  delete: (id) => api.delete(`/alarms/${id}`),
};

// Camera endpoints  
export const cameraAPI = {
  getAll: () => api.get('/cameras'),
  getById: (id) => api.get(`/cameras/${id}`),
  create: (cameraData) => api.post('/cameras', cameraData),
  delete: (id) => api.delete(`/cameras/${id}`),
};