const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');

// Эндпоинт создания нового отдел
router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Данные для создания нового отедал не переданы' });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `INSERT INTO departments (name) VALUES (?)`;

        const [result] = await connection.query(query, [name]);

        await logAction('CREATE', 'departments', result.insertId, null, null, JSON.stringify(req.body), 'good');
        if (result.errno === 1062) {
            res.status(200).json({ message: `Имеется дубликат - ${name}, перепроверте создаваемую запись ` })
        }
        res.status(201).json({ message: 'Отдел успешно создан' });

    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Ошибка при создании нового отдела', error: err.message });
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

// Эндпоинт на получение всех отделов
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = 'SELECT * FROM departments';

        const [results] = await connection.query(query);

        res.status(200).json({ data: results });
    }
    catch (err) {
        res.status(500).json({ message: 'Ошибка получения списка отделов', error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }

})

// Эндпоинт на обновления данных у отдела по id
router.patch('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    const { newValue } = req.body;

    if (!newValue) {
        return res.status(400).json({ message: 'Новое значение не передано' });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `UPDATE departments SET name = ? WHERE id = ?`;
        const oldValue = connection.query('SELECT * FROM departments WHERE id = ?', [id]);
        const [result] = await connection.query(query, [newValue, id]);

        await logAction('UPDATE', 'departments', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        res.status(200).json({ message: `Запись с ID ${id} обновлена` });
    }
    catch (err) {
        res.status(500).json({ message: `Ошибка обновления отдела ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
})

// Эндпоинт на удаление отдела по id
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `DELETE FROM departments WHERE id = ?`;

        const [rows] = await connection.query('SELECT * FROM departments WHERE id = ?', [id]);
        const oldValue = rows.length ? rows[0] : null;
        if (!oldValue) {
            return res.status(404).json({ message: `Отдел с ID ${id} не найден` });
        }

        const [result] = await connection.query(query, [id]);

        await logAction('DELETE', 'departments', id, null, null, JSON.stringify(oldValue), 'good');

        res.status(200).json({ message: `Запись с ID ${id} удалена`, affectedRows: result.affectedRows });
    }
    catch (err) {
        res.status(500).json({ message: `Ошибка при удалении отдела ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});


module.exports = router;