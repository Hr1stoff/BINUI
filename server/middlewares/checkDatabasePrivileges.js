const { createConnection } = require('../utils/dbConnection');

const checkDatabasePrivileges = async (req, res, next) => {
    const { host, user, password } = req.user || req.body;
    let connection;

    try {
        connection = await createConnection({ host, user, password });

        // Получаем список привилегий текущего пользователя
        const query = `SHOW GRANTS FOR CURRENT_USER()`;
        const [grants] = await connection.query(query);

        if (!grants || grants.length === 0) {
            return res.status(403).json({ message: 'Не удалось получить привилегии пользователя.' });
        }

        // Привилегии для ролей
        const adminPrivileges = ['ALL PRIVILEGES'];
        const moderPrivileges = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
        const userPrivileges = ['SELECT'];


        // Преобразуем список привилегий в строку
        const grantsString = grants.map(grant => Object.values(grant).join(' ')).join(' ');

        // Определяем роль на основе привилегий
        let role = null;
        if (adminPrivileges.some(priv => grantsString.includes(priv))) {
            role = 'admin';
        } else if (moderPrivileges.every(priv => grantsString.includes(priv))) {
            role = 'moder';
        } else if (userPrivileges.every(priv => grantsString.includes(priv))) {
            role = 'user';
        }

        // Если роль не определена, запрещаем доступ
        if (!role) {
            return res.status(403).json({ message: 'Недостаточно прав для выполнения операции.' });
        }
        req.user = { host, user, password, role };

        next();
    } catch (err) {
        res.status(500).json({ message: 'Ошибка проверки прав доступа.', error: err.message });
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = checkDatabasePrivileges;