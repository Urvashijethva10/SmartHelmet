import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

export const detectImage = async (file, confidence = 0.3) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/detect?confidence=${confidence}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getDetectionHistory = async (page = 1, limit = 10, status = 'ALL') => {
  const response = await api.get(`/history?page=${page}&limit=${limit}&status=${status}`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
