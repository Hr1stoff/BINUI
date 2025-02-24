const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');

const authRoutes = require('./controllers/authController');
const tableRoutes = require('./controllers/tableController');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
}));


// Исправлено: теперь API корректно размещены внутри `/api/`
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.Console({ format: winston.format.simple() }),
//   ],
// });

// app.use(morgan('combined'));
// app.use((err, req, res, next) => {
//   logger.error(err.message);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// Автоматическое подключение маршрутов из "controllers/table"
const tableControllersPath = path.join(__dirname, 'controllers', 'table');

fs.readdirSync(tableControllersPath).forEach(file => {
  if (file.endsWith('.js')) {
    const route = require(`./controllers/table/${file}`);

    if (typeof route === 'function' || (typeof route === 'object' && 'use' in route)) {
      let routeName = file.replace('Controller.js', '')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase();

      console.log(`Подключен маршрут: /api/${routeName}`);
      app.use(`/api/${routeName}`, route);
    } else {
      console.error(`Ошибка: файл ${file} не экспортирует Express Router`);
    }
  }
});


// Добавляем тестовый маршрут, чтобы проверить, работает ли сервер
app.get('/api/', (req, res) => {
  res.json({ message: 'API работает!' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
