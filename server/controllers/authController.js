const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createConnection } = require('../utils/dbConnection');
const checkDatabasePrivileges = require('../middlewares/checkDatabasePrivileges');
const crypto = require('crypto');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';

const ACCESS_TOKEN_LIFETIME = '7d';
const REFRESH_TOKEN_LIFETIME = '7d';

let refreshTokens = [];


router.post('/connect', checkDatabasePrivileges, async (req, res) => {
  const { host, user, password, role } = req.user;

  if (!host || !user || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  let connection;

  try {
    connection = await createConnection({ host, user, password });
    
    const payload = { host, user, password };
    // Создаём токены
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME });

    // Добавляем refreshToken в массив
    refreshTokens.push(refreshToken);

    // Отправляем токены клиенту
    res.status(200).json({ accessToken, refreshToken, role });

  } catch (err) {
    if (err.code === 'ETIMEDOUT') {
      return res.status(500).json({ message: 'Ошибка: Таймаут соединения с базой данных' });
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(401).json({ message: 'Ошибка: Неверные учетные данные для базы данных' });
    }
    res.status(500).json({ message: 'Ошибка подключения к базе данных', error: err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Эндпоинт обновления токена
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token отсутствует или недействителен' });
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);


    const newAccessToken = jwt.sign(
      { host: user.host, user: user.user },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_LIFETIME }
    );

    const newRefreshToken = jwt.sign(
      { host: user.host, user: user.user },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_LIFETIME }
    );
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    refreshTokens.push(newRefreshToken);


    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });


  } catch (err) {
    res.status(403).json({ message: 'Refresh token истек или некорректен' });
  }
});

// Эндпоинт для выхода (удаление refresh токена)
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token обязателен' });
  }

  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  res.status(200).json({ message: 'Выход выполнен успешно' });
});

module.exports = router;
