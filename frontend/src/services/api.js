import axios from 'axios';
import AuthService from '@/services/authService';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});
//'http://localhost:3000/api' 'http://85.192.30.80:8080/api

// Добавляем токен в заголовки запросов
api.interceptors.request.use(async (config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Автоматическое обновление токена при 401
let isRefreshing = false;
let failedRequestsQueue = [];

api.interceptors.response.use(response => response, async (error) => {
  const originalRequest = error.config;

  // Если получили 401, пытаемся обновить токен
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await AuthService.refreshAccessToken();

      // Сохранение нового токена
      try {
        localStorage.setItem('accessToken', newAccessToken);
      } catch (err) {
        console.error('Ошибка записи в localStorage:', err);
      }

      api.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;

      // Повторяем все запросы из очереди
      failedRequestsQueue.forEach((callback) => callback.resolve(newAccessToken));
      failedRequestsQueue = [];

      return api(originalRequest);
    } catch (err) {
      console.error('Ошибка обновления токена:', err);
      failedRequestsQueue.forEach((callback) => callback.reject(err));

      AuthService.logout();
      window.location.href = '/';
    } finally {
      isRefreshing = false;
    }
  }

  // Если получили 403, сразу разлогиниваем пользователя
  if (error.response?.status === 403) {
    AuthService.logout();
    window.location.href = '/';
  }

  return Promise.reject(error);
});

export default api;
