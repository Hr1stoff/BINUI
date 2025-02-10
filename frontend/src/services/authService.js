import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // 🔹 Теперь API правильно указывает на /api/auth

class AuthService {
  static async login({ host, login, password }) {
    try {
      const response = await axios.post(`${API_URL}/auth/connect`, { host, user: login, password });

      const { accessToken, refreshToken, role } = response.data;

      if (accessToken && refreshToken && role) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('role', role);
      }

      return response.data;
    } catch (error) {
      console.error('Ошибка авторизации:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }

  static async refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('Отсутствует refresh token');

      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      return accessToken;
    } catch (error) {
      console.error('Ошибка обновления токена:', error.response?.data?.message || error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        AuthService.logout();
      }

      throw error;
    }
  }
}

export default AuthService;
