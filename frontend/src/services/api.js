import axios from 'axios';
import AuthService from '@/services/authService';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Добавляем токен в заголовки запросов
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Автоматическое обновление токена при 401
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401) {
    try {
      const newAccessToken = await AuthService.refreshAccessToken();
      error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return axios.request(error.config);
    } catch (err) {
      AuthService.logout();
      window.location = '/';
    }
  }
  return Promise.reject(error);
});

export default api;