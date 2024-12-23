const mysql = require('mysql2/promise');

const createConnection = async ({ host, user, password }) => {
  return mysql.createConnection({ host, user, password, database: 'system_access' });
};

module.exports = { createConnection };
