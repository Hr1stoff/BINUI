const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createConnection } = require('../utils/dbConnection');

const ACCESS_TOKEN_SECRET = 'ENCeQEGvewBVvGfUa6xo3m6QNyHenKJcCKvQzdgCHHj67Dvu4yEjOfqjbFXWK0rx';
const REFRESH_TOKEN_SECRET = 'I3SlsIqQG0TPImYsMHXY3WW6OvoLNUFo1wh95Aan6YeZiQQeiT5hhLMdMGKYIYuA';
let refreshTokens = [];

// Эндпоинт авторизации
router.post('/connect', async (req, res) => {
  const { host, user, password } = req.body;

  if (!host || !user || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  try {
    const connection = await createConnection({ host, user, password });
    await connection.end();

    const accessToken = jwt.sign({ host, user, password }, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ host, user, password }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка подключения к базе данных' });
  }
});

// Эндпоинт обновления токена
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token отсутствует или недействителен' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Refresh token истек' });

    const newAccessToken = jwt.sign({ host: user.host, user: user.user }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
});

module.exports = router;
