const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


//Эндпоинт на получения всех пользователей 
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `SELECT 
    u.id,
    u.username,
    u.full_name,
    u.mail,
    d.name AS department_name,
    p.name AS position_name,
    u.active,
    u.phone,
    u.tg_id,
    u.tg_status,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN position p ON u.position_id = p.id;
`;
        const [results] = await connection.query(query);

        res.status(200).json({ data: results });

    }
    catch (err) {
        res.status(500).json({ message: ' Ошибка получения списка пользователей', error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

// Эндпоинт на удаления пользователя по id 
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;


    try {
        connection = await createConnection({ host, user, password });
        const query = `DELETE FROM users WHERE id = ?`;

        const [oldValue] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);

        if (oldValue.length === 0) {
            return res.status(404).json({ message: `Запись с ID ${id} не найдена` });
        }

        const [result] = await connection.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Запись с ID ${id} не найдена` });
        }

        await logAction('DELETE', 'users', id, null, null, JSON.stringify(oldValue), 'good');


        res.status(200).json({ message: `Запись с ID ${id} удалена` });
    } catch (err) {
        console.error("Ошибка в запросе к БД:", err);
        res.status(500).json({ message: `Ошибка при удалении пользователя с ID ${id}`, error: err.message });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


module.exports = router;