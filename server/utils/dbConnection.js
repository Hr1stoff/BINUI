const mysql = require('mysql2/promise');
require('dotenv').config();

const createConnection = async ({ host, user, password }) => {
  return mysql.createConnection({ host, user, password, database: process.env.DATABASE_NAME, connectTimeout: 10000});
};

module.exports = { createConnection };
