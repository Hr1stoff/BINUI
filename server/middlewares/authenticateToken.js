const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('Ошибка: ACCESS_TOKEN_SECRET не загружен! Проверьте файл .env');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Некорректный формат токена!' });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует!' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: err.name === 'TokenExpiredError' ? 'Токен истёк!' : 'Неверный токен!',
      });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
