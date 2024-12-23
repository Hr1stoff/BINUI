const express = require('express');
const cors = require('cors');
const authRoutes = require('./controllers/authController');
const tableRoutes = require('./controllers/tableController');
const userTypeRoutes = require('./controllers/userTypeController');
const updateRoutes = require('./controllers/updateController');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:8080' }));

// Подключение маршрутов
app.use('/auth', authRoutes);
app.use('/tables', tableRoutes);
app.use('/userType', userTypeRoutes);
app.use('/update', updateRoutes);

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
