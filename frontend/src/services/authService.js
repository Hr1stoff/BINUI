import axios from 'axios';

const API_URL = 'http://localhost:3000';

class AuthService {
  static async login({ host, login, password }) {
    const response = await axios.post(`${API_URL}/auth/connect`, {
      host,
      user: login,
      password,
    });

    const { accessToken, refreshToken } = response.data;

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }

    return response.data;
  }

  static logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token отсутствует');
    }

    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const { accessToken } = response.data;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }

    return accessToken;
  }
}

export default AuthService;
