const express = require('express');
const router = express.Router();
const { createConnection } = require('../utils/dbConnection');
const authenticateToken = require('../middlewares/authenticateToken');

// Эндпоинт получения значений user_type
router.get('/getUserTypeOptions', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;

  try {
    const connection = await createConnection({ host, user, password });
    const [results] = await connection.query(`SHOW COLUMNS FROM access_rights LIKE 'user_type'`);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Поле user_type не найдено.' });
    }

    const typeDefinition = results[0].Type;
    const userTypeOptions = typeDefinition
      .replace(/enum\(|\)/g, '')
      .split(',')
      .map(value => value.replace(/'/g, ''));

    res.status(200).json({ userTypeOptions });
    await connection.end();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка выполнения запроса' });
  }
});

module.exports = router;
