const express = require('express');
const router = express.Router();
const { createConnection } = require('../utils/dbConnection');
const authenticateToken = require('../middlewares/authenticateToken');
const { generationQuery } = require('../utils/queryGenerator');

// Эндпоинт получения данных таблиц
router.get('/getTable', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;
  const tableName = req.query.table;

  if (!tableName) {
    return res.status(400).json({ message: 'Имя таблицы не указано' });
  }

  try {
    const connection = await createConnection({ host, user, password });
    const query = await generationQuery(connection, tableName);

    const [results] = await connection.query(query);

    res.status(200).json({ table: results });
    await connection.end();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обработки запроса' });
  }
});

// Эндпоинт получения всех таблиц
router.get('/getAllTable', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;

  try {
    const connection = await createConnection({ host, user, password });
    const [results] = await connection.query('SHOW TABLES;');
    const tables = results.map(row => Object.values(row)[0]);

    res.status(200).json({ tables });
    await connection.end();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка выполнения запроса' });
  }
});

router.get('/getSystems', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;
  try {
    const connection = await createConnection({ host, user, password })
    const [result] = await connection.query('SELECT * FROM systems;')
    res.status(200).json({ result })

  } catch (err) {
    res.status(500).json({ message: 'Ошибка выполнения запроса' });
  }
})

module.exports = router;
