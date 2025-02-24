const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


// Эндпоинт для создания новой должности
router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { name } = req.body;
    

    if (!name) {
        res.status(400).json({ message: 'Должность не передана, заполните поле!' });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `INSERT INTO \`position\` (\`name\`) VALUES (?)`;

        const [result] = await connection.query(query, [name]);
        await logAction('CREATE', 'position', result.insertId, null, null, JSON.stringify(req.body), 'good');
        res.status(201).json({ message: 'Должность успешна создана' });

    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Ошибка в создании новой должности', error: err.message });
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

// Эндпоинт на получение всех должностей
router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = 'SELECT * FROM position';


        const [results] = await connection.query(query);

        res.status(200).json({ data: results });
    }
    catch (err) {
        res.status(500).json({ message: 'Ошибка получения списка должностей', error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

// Эндпоинт на обновление данных у должности по id
router.patch('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    const { newValue } = req.body;
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `UPDATE position SET name = ? WHERE id = ?`;
        const oldValue = connection.query('SELECT * FROM position WHERE id = ?', [id]);

        const [result] = await connection.query(query, [newValue, id]);
        await logAction('UPDATE', 'position', result.insertId, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        res.status(200).json({ message: `Запись c ID ${id} обновлена` });

    }
    catch (err) {
        res.status(500).json({ message: `Ошибка обновления должности ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

// Эндпоинт на удалении должности по id 
router.delete('/:id', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;
    let connection;

    try {
        connection = await createConnection({ host, user, password });

        const [oldValue] = await connection.query('SELECT * FROM position WHERE id = ?', [id]);
        if (oldValue.length === 0) {
            return res.status(404).json({ message: `Должность с ID ${id} не найдена` });
        }

        const [dependencies] = await connection.query('SELECT COUNT(*) AS count FROM access_rights WHERE position_id = ?', [id]);
        if (dependencies[0].count > 0) {
            return res.status(400).json({ 
                message: `Невозможно удалить должность ${id}, так как на неё ссылаются записи в access_rights. Удалите зависимые записи сначала.` 
            });
        }

        await connection.query('DELETE FROM position WHERE id = ?', [id]);

        await logAction('DELETE', 'position', id, null, null, JSON.stringify(oldValue[0]), 'good');

        res.status(200).json({ message: `Должность ${id} успешно удалена` });
    }
    catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: `Ошибка: Должность ${id} не может быть удалена, так как есть связанные записи.`,
                error: err.message
            });
        }
        console.error("Ошибка в запросе к БД:", err); 
        res.status(500).json({ message: `Ошибка при удалении должности ${id}`, error: err.message });
    }
    finally {
        if (connection) await connection.end();
    }
});

module.exports = router;