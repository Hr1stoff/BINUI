const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');



router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { user_id, system_id, status } = req.body;

    if (!user_id || !system_id || typeof status === 'undefined') {
        return res.status(400).json({
            message: 'Не переданы все обязательные параметры',
        });
    }

    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `
            INSERT INTO open_in_systems (user_id, system_id, status)
            VALUES (?, ?, ?);
        `;
        const [result] = await connection.query(query, [user_id, system_id, status]);

        await logAction('CREATE', 'open_in_systems', result.insertId, null, null, JSON.stringify(req.body), 'good');

        res.status(201).json({
            message: 'Запись успешно добавлена',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при создании записи',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});


router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            SELECT * FROM open_in_systems
        `;
        const [results] = await connection.query(query);

        res.status(200).json({
            message: 'Данные успешно получены',
            data: results,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при получении данных',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

router.patch('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { status } = req.body;
    const { id } = req.params;

    if (typeof status === 'undefined') {
        return res.status(400).json({
            message: 'Не передан параметр status',
        });
    }

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            UPDATE open_in_systems
            SET status = ?
            WHERE id = ?;
        `;

        const oldValue = connection.query('SELECT * FROM open_in_systems WHERE id = ?', [id]);

        const [result] = await connection.query(query, [status, id]);
        await logAction('UPDATE', 'open_in_systems', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись не найдена',
            });
        }

        res.status(200).json({
            message: 'Статус успешно обновлен',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при обновлении записи',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            DELETE FROM open_in_systems WHERE id = ?;
        `;
        const [oldValue] = await connection.query('SELECT * FROM open_in_systems WHERE id = ?', [id]);

        const [result] = await connection.query(query, [id]);
        await logAction('DELETE', 'open_in_systems', result.insertId, null, null, JSON.stringify(oldValue), 'good');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись не найдена',
            });
        }

        res.status(200).json({
            message: 'Запись успешно удалена',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при удалении записи',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;


