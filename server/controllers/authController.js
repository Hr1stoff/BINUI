const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createConnection } = require('../utils/dbConnection');
const crypto = require('crypto');


const ACCESS_TOKEN_SECRET = 'ENCeQEGvewBVvGfUa6xo3m6QNyHenKJcCKvQzdgCHHj67Dvu4yEjOfqjbFXWK0rx';
const REFRESH_TOKEN_SECRET = 'I3SlsIqQG0TPImYsMHXY3WW6OvoLNUFo1wh95Aan6YeZiQQeiT5hhLMdMGKYIYuA';
const ACCESS_TOKEN_LIFETIME = '7d';
const REFRESH_TOKEN_LIFETIME = '7d';


let refreshTokens = [];


router.post('/connect', async (req, res) => {
  const { host, user, password } = req.body;

  if (!host || !user || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const connection = await createConnection({ host, user, password });
    await connection.end();


    const payload = { host, user, password };
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME });

    refreshTokens.push(refreshToken);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    if (err.code === 'ETIMEDOUT') {
      return res.status(500).json({ message: 'Ошибка: Таймаут соединения с базой данных' });
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(401).json({ message: 'Ошибка: Неверные учетные данные для базы данных' });
    }
    res.status(500).json({ message: 'Ошибка подключения к базе данных', error: err.message });
  }
});

// Эндпоинт обновления токена
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token отсутствует или недействителен' });
  }

  try {
    const user = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { host: user.host, user: user.user },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_LIFETIME }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Refresh token истек или некорректен' });
  }
});

// Эндпоинт для выхода (удаление refresh токена)
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken); // Удаляем токен
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
