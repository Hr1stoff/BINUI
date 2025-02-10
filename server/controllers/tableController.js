const express = require('express');
const router = express.Router();
const { createConnection } = require('../utils/dbConnection');
const authenticateToken = require('../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../middlewares/checkDatabasePrivileges');


// Эндпоинт получения имен всех таблиц
router.get('/tablesName', authenticateToken, checkDatabasePrivileges, async (req, res) => {
  const { host, user, password } = req.user;

  let connection;
  try {
    connection = await createConnection({ host, user, password });
    const [results] = await connection.query('SHOW TABLES;');
    const tables = results.map(row => Object.values(row)[0]);

    res.status(200).json({ tables });

  } catch (err) {
    res.status(500).json({ message: 'Ошибка выполнения запроса', error: err.message });
  } finally {
    if (connection) await connection.end();
  }
});


router.get('/typeTable', authenticateToken, checkDatabasePrivileges, async (req, res) => {
  const { host, user, password } = req.user;
  const { nameTable } = req.query;

  let connection;
  try {
    connection = await createConnection({ host, user, password });
    const [columns] = await connection.query(`SHOW COLUMNS FROM ${nameTable};`);

    const formattedColumns = columns.map(column => {
      if (column.Type.startsWith('enum')) {
        const enumValues = column.Type
          .replace(/^enum\(/, '')
          .replace(/\)$/, '')
          .split(',')
          .map(value => value.replace(/^'|'$/g, ''));
        return { ...column, enumValues };
      }
      return column;
    });

    res.status(200).json({ columns: formattedColumns });

  } catch (err) {
    res.status(500).json({ message: 'Ошибка в получении полей таблицы', error: err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Эндпоинт получения значений user_type
router.get('/getUserTypeOptions', authenticateToken, checkDatabasePrivileges, async (req, res) => {
  const { host, user, password } = req.user;
  let connection;

  try {
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
    res.status(200).json({ data: userTypeOptions });

  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
    res.status(500).json({ message: 'Ошибка выполнения запроса', error: err.message });
  } finally {
    if (connection) {
      await connection.end().catch(err => console.error('Ошибка закрытия соединения:', err));
    }
  }
});

// Эндпоинт на получения информации о структуре таблицы
router.get('/:table_name/structure', authenticateToken, checkDatabasePrivileges, async (req, res) => {
  const { host, user, password } = req.user;
  const { table_name } = req.params;

  // Проверка, что имя таблицы валидное (только буквы, цифры и _)
  if (!/^[a-zA-Z0-9_]+$/.test(table_name)) {
    return res.status(400).json({ message: 'Некорректное имя таблицы!' });
  }

  let connection;
  try {
    connection = await createConnection({ host, user, password });

    const query = `SHOW COLUMNS FROM \`${table_name}\`;`;
    const [results] = await connection.query(query);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Таблица не найдена' });
    }

    res.status(200).json({
      message: 'Информация о колонках таблицы успешно получена',
      data: results,
    });

  } catch (err) {
    console.error('Ошибка при получении структуры таблицы:', err);
    res.status(500).json({ message: 'Не удалось получить информацию о структуре таблицы', error: err.message });
  } finally {
    if (connection) await connection.end();
  }
});


module.exports = router;
