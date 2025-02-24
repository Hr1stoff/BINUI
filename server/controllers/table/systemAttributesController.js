const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


//Эндпоинт на добавление системных атрибутов
router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { systemId, name, value } = req.body;

    if (!systemId || !name || !value) {
        return res.status(400).json({ message: 'Данные для создания нового атрибута для системы не переданы' });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `INSERT INTO system_attributes (system_id, name, value) VALUES (?, ?, ?)`;

        const [result] = await connection.query(query, [systemId, name, value]);
        await logAction('CREATE', 'system_attributes', result.insertId, null, null, JSON.stringify(req.body), 'good');

        res.status(201).json({ message: 'Атрибут успешно создан' });
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Ошибка в создании новой должности', error: err.message });
        }
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('Ошибка при закрытии соединения:', error.message);
            }
        }
    }
});

// Эндпоинт получения всех атрибутов 
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `SELECT sa.id, s.name AS system_name, sa.name, sa.value
            FROM system_attributes sa
            JOIN systems s ON sa.system_id = s.id`;
        const [results] = await connection.query(query);
        res.status(200).json({ data: results });
    }
    catch (err) {
        console.error("Ошибка в запросе к БД:", err); 
        res.status(500).json({ message: 'Ошибка получения списка системных атрибутов' });
    }
    finally {
        if (connection) await connection.end();
    }
});

//Эндпоинт на обновления данных у системных атрибутов по id
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
        const query = 'UPDATE system_attributes SET name = ? WHERE id = ?';
        const oldValue = connection.query('SELECT * FROM system_attributes WHERE id = ?', [id]);

        const [result] = await connection.query(query, [newValue, id]);
        await logAction('UPDATE', 'system_attributes', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        res.status(200).json({ message: `Запись c ID ${id} обновлена` });
    }
    catch (err) {
        res.status(500).json({
            message: `Ошибка обновления отдела ${id}`, error: err.message
        });
    }
    finally {
        if (connection) await connection.end();
    }
});

// Эндпоинт на удаление системного атрибута по id
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `DELETE FROM system_attributes WHERE id = ?`

        const [oldValue] = await connection.query('SELECT * FROM system_attributes WHERE id = ?', [id]);

        const [result] = await connection.query(query, [id]);
        await logAction('DELETE', 'system_attributes', result.insertId, null, null, JSON.stringify(oldValue), 'good');
        res.status(200).json({ message: `Запись с ID ${id} удалена` });
    }
    catch (err) {
        res.status(500).json({
            message: `Ошибка при удалении системного атрибута c ID ${id}`, error: err.message
        })
    }
    finally {
        if (connection) await connection.end();
    }
})


module.exports = router;