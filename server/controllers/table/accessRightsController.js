const express = require('express');
const router = express.Router();
const { createConnection } = require('../../utils/dbConnection');
const authenticateToken = require('../../middlewares/authenticateToken');
const checkDatabasePrivileges = require('../../middlewares/checkDatabasePrivileges');
const logAction = require('../../middlewares/logger');


//Эндпоинт на создание нового доступа
router.post('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { department_id, position_id, systems, user_type } = req.body;

    if (!department_id || !position_id || !Array.isArray(systems) || systems.length === 0 || !user_type) {
        return res.status(400).json({ message: 'Заполните, пожалуйста, все необходимые поля.' });
    }

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        // Получаем существующие записи
        const checkQuery = `
            SELECT system_id FROM access_rights
            WHERE department_id = ? AND position_id = ? AND user_type = ? AND system_id IN (?);
        `;
        const [existingRows] = await connection.query(checkQuery, [department_id, position_id, user_type, systems]);

        const existingSystemIds = new Set(existingRows.map(row => row.system_id));

        const newValues = systems
            .filter(system_id => !existingSystemIds.has(system_id))
            .map(system_id => [department_id, position_id, system_id, user_type]);

        if (newValues.length === 0) {
            return res.status(200).json({ message: 'Доступ уже существует, новые записи не добавлены' });
        }

        const insertQuery = `
    INSERT INTO access_rights (department_id, position_id, system_id, user_type)
    VALUES ?
    ON DUPLICATE KEY UPDATE user_type = VALUES(user_type);
`;

        const [result] = await connection.query(insertQuery, [newValues]);

        await logAction('CREATE', 'access_rights', result.insertId, null, null, JSON.stringify(req.body), 'good');

        res.status(201).json({ message: 'Новый доступ успешно открыт' });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при создании нового доступа',
            error: err.message
        });
    } finally {
        if (connection) await connection.end();
    }
});


//Эндпоинт на получение всех прав доступа 
const generateDynamicColumns = async (connection) => {

    const [systems] = await connection.query('SELECT name FROM systems');
    if (!systems || systems.length === 0) {
        throw new Error('Список систем пуст или не получен.');
    }

    const systemColumns = systems
        .map(system => `MAX(CASE WHEN s.name = '${system.name}' THEN 1 ELSE 0 END) AS \`${system.name}\``)
        .join(', ');

    return systemColumns;
};

router.get('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    let connection;
    try {
        connection = await createConnection({ host, user, password });

        // Получаем список всех систем
        const [systems] = await connection.query('SELECT id, name FROM systems');
        if (!systems.length) {
            throw new Error('Список систем пуст или не получен.');
        }

        // Делаем SQL-запрос для получения всех прав
        const query = `
            SELECT 
                MIN(ar.id) AS id,
                d.name AS department_name,
                p.name AS position_name,
                ar.user_type,
                s.name AS system_name
            FROM 
                access_rights ar
            JOIN 
                departments d ON ar.department_id = d.id
            JOIN 
                position p ON ar.position_id = p.id
            JOIN 
                systems s ON ar.system_id = s.id
            GROUP BY 
                d.name, p.name, ar.user_type, s.name
            ORDER BY 
                id ASC;
        `;

        const [results] = await connection.query(query);

        // Группируем данные
        const groupedResults = results.reduce((acc, row) => {
            const key = `${row.department_name}-${row.position_name}-${row.user_type}`;
            if (!acc[key]) {
                acc[key] = {
                    id: row.id,
                    department_name: row.department_name,
                    position_name: row.position_name,
                    user_type: row.user_type,
                    systems: {}
                };

                // Заполняем все системы 0 по умолчанию
                systems.forEach(system => {
                    acc[key].systems[system.name] = 0;
                });
            }

            // Если доступ есть, ставим 1
            acc[key].systems[row.system_name] = 1;
            return acc;
        }, {});

        // Преобразуем объект обратно в массив
        const formattedResults = Object.values(groupedResults).map(item => ({
            id: item.id,
            department_name: item.department_name,
            position_name: item.position_name,
            user_type: item.user_type,
            systems: Object.entries(item.systems).map(([name, access]) => ({ [name]: access }))
        }));

        res.status(200).json({
            message: 'Права доступа успешно получены',
            data: formattedResults
        });
    }
    catch (err) {
        console.error("Ошибка в запросе к БД:", err); 
        res.status(500).json({
            message: 'Ошибка при получении списка прав доступа',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});


// Получения списка конкретных должностей по названию отдела
router.get('/departments/:id/position', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { id } = req.params;

    let connection;
    try {
        connection = await createConnection({ host, user, password });

        const query = `
            SELECT DISTINCT 
    p.id AS position_id,
    p.name AS position_name
FROM access_rights ar
JOIN position p ON ar.position_id = p.id
WHERE ar.department_id = ?
ORDER BY p.name;

        `;

        const [result] = await connection.query(query, [id]);
        res.status(200).json({
            message: 'Список успешно получен',
            data: result
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Ошибка при получении списка должностей по названию отдела',
            error: err.message,
        });
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Эндпоинт на обновления прав доступа 
router.patch('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { departmentName, positionName, user_type } = req.body;

    if (!departmentName || !positionName || !user_type) {
        return res.status(400).json({
            message: 'Не переданы необходимые данные для обновления прав доступа',
        });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `
          UPDATE access_rights
          SET user_type = ?
          WHERE department_id IN (
              SELECT id FROM departments WHERE name = ?
          )
          AND position_id IN (
              SELECT id FROM position WHERE name = ?
          );
        `;
        const oldValue = connection.query(`SELECT ar.id, ar.user_type, d.name AS department_name, p.name AS position_name
             FROM access_rights ar
             JOIN departments d ON ar.department_id = d.id
             JOIN position p ON ar.position_id = p.id
             WHERE d.name = ? AND p.name = ?`,
            [departmentName, positionName]);

        const [result] = await connection.query(query, [user_type, departmentName, positionName]);

        await logAction('UPDATE', 'access_rights', result.affectedRows, null, JSON.stringify(oldValue), JSON.stringify(req.body), 'good');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись с указанным id не найдена или данные не изменены',
            });
        }

        res.status(200).json({
            message: 'Права доступа успешно обновлены',
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Ошибка при обновлении прав доступа',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }


});


//Эндпоинт на удаление прав доступа
router.delete('/', authenticateToken, checkDatabasePrivileges, async (req, res) => {
    const { host, user, password } = req.user;
    const { department_id, position_id, system_id } = req.body;

    if (!department_id || !position_id || !system_id) {
        return res.status(400).json({
            message: 'Не переданы необходимые параметры для удаления доступа',
        });
    }
    let connection;
    try {
        connection = await createConnection({ host, user, password });
        const query = `
        DELETE FROM access_rights 
        WHERE 
            department_id = ? AND 
            position_id = ? AND 
            system_id = ?`;

        const [oldValue] = await connection.query(`
                SELECT * FROM access_rights 
                WHERE department_id = ? AND position_id = ? AND system_id = ?`,
            [department_id, position_id, system_id]
        );


        const [result] = await connection.query(query, [department_id, position_id, system_id]);
        await logAction('DELETE', 'access_rights', result.insertId, null, null, JSON.stringify(oldValue), 'good');

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Запись для удаления не найдена',
            });
        }

        res.status(200).json({
            message: 'Доступ успешно удален',
        });
    } catch (err) {
        res.status(500).json({
            message: 'Ошибка при удалении доступа',
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }

});



module.exports = router;