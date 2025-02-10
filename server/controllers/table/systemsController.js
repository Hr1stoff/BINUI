const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


// Эндпоинт создания новой системы
router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { name } = req.body;

    if (!name) {
        res.status(400).json({ message: 'Данные для создания нового системы не передана' });
    };
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `INSERT INTO systems (name) VALUES (?)`;

        const [result] = await connection.query(query, [name]);
        await logAction('CREATE', 'systems', result.insertId, null, null, JSON.stringify(req.body), 'good');
        res.status(201).json({ message: 'Система успешно создана' });
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Ошибка при создании новой системы', error: err.message });
        }
    }
    finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('Ошибка при закрытии соединения:', error.message);
            }
        }
    }
});

// Эндпоинт на получение всех систем
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = 'SELECT * FROM systems';

        const [results] = await connection.query(query);
        res.status(200).json({ data: results });
    }
    catch (err) {
        res.status(500).json({ message: 'Ошибка получения списка систем', error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

//Эндпоинт на обновления данных у сисемы по id 
router.patch('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    const { newValue } = req.body;

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const oldValue = await connection.query('SELECT * FROM systems WHERE id = ?', [id]);

        const query = `UPDATE systems SET name = ? WHERE id = ?`;

        const [result] = await connection.query(query, [newValue, id]);
        await logAction('UPDATE', 'systems', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        res.status(200).json({ message: `Записи c ID ${id} обновлена` });
    }
    catch (err) {
        res.status(500).json({ message: `Ошибка обновления системы ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

//Эндпоинт на удаление системы по id 
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;


    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `DELETE FROM systems WHERE systems.id = ?`;

        const [oldValue] = await connection.query('SELECT * FROM systems WHERE id = ?', [id]);

        const [result] = await connection.query(query, [id]);
        await logAction('DELETE', 'systems', result.insertId, null, null, JSON.stringify(oldValue), 'good');

        res.status(200).json({ message: `Запись c ID ${id} удалена` });
    }
    catch (err) {
        console.log(err);
        
        res.status(500).json({ message: `Ошибка при удалении системы ${id}`, error: err.message })
    }
    finally {
        if (connection) await connection.end();
    }
});

module.exports = router;