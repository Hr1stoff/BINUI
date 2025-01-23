const express = require('express');
const router = express.Router();
const { createConnection } = require('../utils/dbConnection');
const authenticateToken = require('../middlewares/authenticateToken');

// Эндпоинт получения значений user_type
router.get('/getUserTypeOptions', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;
  let connection;

  try {
    // Подключение к базе данных
    connection = await createConnection({ host, user, password });

    // Проверка наличия столбца user_type в таблице access_rights
    const [results] = await connection.query(`SHOW COLUMNS FROM access_rights LIKE 'user_type'`);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Поле user_type не найдено.' });
    }

    // Извлечение значений ENUM
    const typeDefinition = results[0].Type;
    const userTypeOptions = typeDefinition
      .match(/'([^']+)'/g)
      .map(value => value.replace(/'/g, ''));

    res.status(200).json({ userTypeOptions });
  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
    res.status(500).json({ message: 'Ошибка выполнения запроса', error: err.message });
  } finally {
    if (connection) {
      await connection.end().catch(err => console.error('Ошибка закрытия соединения:', err));
    }
  }
});

module.exports = router;
