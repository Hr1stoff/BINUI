const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = 'ENCeQEGvewBVvGfUa6xo3m6QNyHenKJcCKvQzdgCHHj67Dvu4yEjOfqjbFXWK0rx';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует!' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Неверный или истекший токен!' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
