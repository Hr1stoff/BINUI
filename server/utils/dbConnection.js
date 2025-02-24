const mysql = require('mysql2/promise');
require('dotenv').config();

const createConnection = async ({ host, user, password }) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST || host,
      user: process.env.DATABASE_USER || user,
      password: process.env.DATABASE_PASSWORD || password,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT || 3306,
      connectTimeout: 30000
    });
    return connection;
  }
  catch (error) {
    console.error("❌ MySQL connection error:", error.message);
    throw error;
  }


};



module.exports = { createConnection };