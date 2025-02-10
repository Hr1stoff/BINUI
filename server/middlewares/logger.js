const mysql = require('mysql2/promise');
require('dotenv').config();

const logAction = async (action, table_name, record_id, user_id, old_value, new_value, status) => {
    let connection;
    try {

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DATABASE_NAME
        });

        await connection.execute(
            `INSERT INTO logs (location, action, timestamp, table_name, record_id, user_id, old_value, new_value, status) 
            VALUES ('INTERFACE', ?, NOW(), ?, ?, ?, ?, ?, ?)`,
            [action, table_name, record_id, user_id, old_value, new_value, status]
        );

    } catch (err) {
        console.error("Ошибка логирования:", err);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

module.exports = logAction;

