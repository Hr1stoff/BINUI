const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Секретные ключи
const ACCESS_TOKEN_SECRET = 'ENCeQEGvewBVvGfUa6xo3m6QNyHenKJcCKvQzdgCHHj67Dvu4yEjOfqjbFXWK0rx';
const REFRESH_TOKEN_SECRET = 'I3SlsIqQG0TPImYsMHXY3WW6OvoLNUFo1wh95Aan6YeZiQQeiT5hhLMdMGKYIYuA';

// Хранилище для refresh токенов
let refreshTokens = [];

app.use(express.json());
app.use(cors({ origin: 'http://localhost:8080' }));

// Подключение к базе данных
const createConnection = (host, user, password) => {
  return mysql.createConnection({
    host,
    user,
    password,
    database: 'system_access',
  });
};

// Эндпоинт авторизации
app.post('/connect', (req, res) => {
  const { host, user, password } = req.body;

  if (!host || !user || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  const connection = createConnection(host, user, password);
  connection.connect((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка подключения к базе данных' });
    }

    const accessToken = jwt.sign({ host, user, password }, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ host, user, password }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);

    res.status(200).json({ accessToken, refreshToken });
    connection.end();
  });
});


const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

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

// Эндпоинт обновления токена
app.post('/refresh', (req, res) => {
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

// Эндпоинт получения всех данных таблиц
app.get('/getAllTable', authenticateToken, (req, res) => {
  const { host, user, password } = req.user;

  const connection = mysql.createConnection({
    host,
    user,
    password,
    database: 'system_access'
  });

  connection.connect((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка подключения к базе данных: ' + err.message });
    }

    const query = 'SHOW TABLES;';
    connection.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка выполнения запроса: ' + err.message });
      }

      const tables = results.map(row => Object.values(row)[0]);
      res.status(200).json({ tables });
    });

    connection.end();
  });
});

// Эндпоинт получения данных таблиц
app.get('/getTable', authenticateToken, (req, res) => {
  const { host, user, password } = req.user;
  const tableName = req.query.table;

  if (!tableName) {
    return res.status(400).json({ message: 'Имя таблицы не указано' });
  }

  const connection = mysql.createConnection({
    host,
    user,
    password,
    database: 'system_access'
  });

  const generationQuery = (tableName) => {
    try {

      if (tableName === 'access_rights') {
        return `
          SELECT 
      MIN(ar.id) AS id,
      d.name AS department_id,
      p.name AS position_id,
      ar.user_type,
      MAX(CASE WHEN s.name = 'AD' THEN 1 ELSE 0 END) AS AD,
      MAX(CASE WHEN s.name = 'EMAIL' THEN 1 ELSE 0 END) AS EMAIL,
      MAX(CASE WHEN s.name = 'BITRIX24' THEN 1 ELSE 0 END) AS BITRIX24,
      MAX(CASE WHEN s.name = 'SM_BINUU00' THEN 1 ELSE 0 END) AS SM_BINUU00,
      MAX(CASE WHEN s.name = 'SM_LOCAL' THEN 1 ELSE 0 END) AS SM_LOCAL,
      MAX(CASE WHEN s.name = '1CERP' THEN 1 ELSE 0 END) AS 1CERP,
      MAX(CASE WHEN s.name = '1CRTL' THEN 1 ELSE 0 END) AS 1CRTL,
      MAX(CASE WHEN s.name = '1CZUP' THEN 1 ELSE 0 END) AS 1CZUP
  FROM 
      access_rights ar
  JOIN 
      departments d ON ar.department_id = d.id
  JOIN 
      position p ON ar.position_id = p.id
  JOIN 
      systems s ON ar.system_id = s.id
  WHERE 
      ar.id >= 1
  GROUP BY 
      d.name, p.name, ar.user_type
  ORDER BY 
      id ASC;
  
        `;
      }
      else {
        return `SELECT * FROM ${tableName};`;
      }
    }
    catch {
      return 'Invalid table name';
    }
  };

  connection.connect((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка подключения к базе данных: ' + err.message });
    }

    query = generationQuery(tableName)

    connection.query(query, (err, results) => {
      if (err) {
        connection.end();
        return res.status(500).json({ message: 'Ошибка выполнения запроса: ' + err.message });
      }
      res.status(200).json({ table: results });

      connection.end();
    });
  });
});

function logChange(tableName, recordId, action, oldValue, newValue) {
  const query = `
      INSERT INTO logs (table_name, record_id, action, timestamp, old_value, new_value)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
  `;
  const values = [tableName, recordId, action, JSON.stringify(oldValue), JSON.stringify(newValue)];

  db.query(query, values, (err) => {
      if (err) console.error('Error logging change:', err);
      else console.log('Change logged successfully');
  });
}


// Эндпоинт на изменение данных таблиц
app.patch('/changeRow', authenticateToken, (req, res) => {
  const connection = mysql.createConnection({
    host,
    user,
    password,
    database: 'system_access'
  });
  const { host, user, password } = req.user;
  const tableName = req.query.table;

  const data = req.query.row;
  const rowId = data.id;

  if (!tableName) {
    return res.status(400).json({ message: 'Имя таблицы не указано' });
  }
  if (!data && !rowId) {
    return res.status(400).json({ message: 'Данные не были отправлены' });
  }


  const generationQuery = (tableName) => {
    if (tableName == 'access_rights') {
      const department = data.department_id
      const position = data.position_id
    }
    else{
      return `SELECT * FROM ${tableName} WHERE id = ${rowId}`;
    }
  }
  
  
  const query = generationQuery(tableName)

  connection.query(query, (err, results) => {
    if (err) {
      connection.end();
      return res.status(500).json({ message: 'Ошибка выполнения запроса: ' + err.message });
    }
    const oldData = results[0];


  })

})


app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
