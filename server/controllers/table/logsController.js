const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


//Эндпоинт получение списка логов
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = 'SELECT * FROM logs';

        const [results] = await connection.query(query);
        res.status(200).json({ data: results });

    }
    catch (err) {
        res.status(500).json({ message: 'Ошибка при получении списка логов', error: err.message })
    }
    finally {
        if (connection) await connection.end();
    }
});

//Эндпоинт на удаление лога по id
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `DELETE FROM logs WHERE id = ?`;

        await connection.query(query, [id]);

        res.status(200).json({ message: `Лог c ID ${id} удален` });

    }
    catch (err) {
        res.status(500).json({ message: `Ошибка при удаления лога с ID ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

module.exports = router;