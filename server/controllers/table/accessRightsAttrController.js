const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');

router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
           SELECT 
    ara.id AS id,  
    d.name AS department, 
    p.name AS position, 
    s.name AS systems, 
    sa.name AS attribute, 
    sa.value AS value
FROM access_rights_attr ara
JOIN system_attributes sa ON ara.system_attribute_id = sa.id
JOIN access_rights ar ON ara.access_rights_id = ar.id
JOIN departments d ON ar.department_id = d.id
JOIN position p ON ar.position_id = p.id
JOIN systems s ON ar.system_id = s.id
ORDER BY d.name, p.name, s.name, sa.name;

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


router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { access_rights_id, system_attribute_id } = req.body;

    if (!access_rights_id || !system_attribute_id) {
        return res.status(400).json({
            message: 'Не переданы все обязательные параметры',
        });
    }

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            INSERT INTO access_rights_attr (access_rights_id, system_attribute_id)
            VALUES (?, ?);
        `;
        const [result] = await connection.query(query, [access_rights_id, system_attribute_id]);


        await logAction('CREATE', 'access_rights_attr', result.insertId, null, null, JSON.stringify(req.body), 'good');


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


router.patch('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { access_rights_id, system_attribute_id } = req.body;
    const { id } = req.params;

    if (!access_rights_id && !system_attribute_id) {
        return res.status(400).json({
            message: 'Не переданы параметры для обновления',
        });
    }

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            UPDATE access_rights_attr
            SET access_rights_id = COALESCE(?, access_rights_id),
                system_attribute_id = COALESCE(?, system_attribute_id)
            WHERE id = ?;
        `;

        const oldValue = connection.query('SELECT * FROM access_rights_attr WHERE id = ?', [id]);

        const [result] = await connection.query(query, [access_rights_id, system_attribute_id, id]);

        await logAction('UPDATE', 'access_rights_attr', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись не найдена или данные не изменены',
            });
        }

        res.status(200).json({
            message: 'Запись успешно обновлена',
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
            DELETE FROM access_rights_attr WHERE id = ?;
        `;
        const [oldValue] = await connection.query('SELECT * FROM access_rights_attr WHERE id = ?', [id]);
        const [result] = await connection.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись не найдена',
            });
        }
        await logAction('DELETE', 'access_rights_attr', result.insertId, null, null, JSON.stringify(oldValue), 'good');

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