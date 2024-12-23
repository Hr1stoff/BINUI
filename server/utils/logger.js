const logChange = async (connection, tableName, recordId, action, oldValue, newValue) => {
    try {
        const query = `
        INSERT INTO table_logs (table_name, record_id, action, old_value, new_value, timestamp)
        VALUES (?, ?, ?, ?, ?, NOW());
      `;
        const values = [
            tableName,
            recordId,
            action,
            JSON.stringify(oldValue),
            JSON.stringify(newValue)  
        ];

        await connection.query(query, values);
    } catch (err) {
        console.error('Ошибка записи лога:', err.message);
    }
};

module.exports = { logChange };
