const { Sequelize } = require('sequelize');
const path = require('path');
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'hotel_management';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';

let sequelize;

if (process.env.USE_SQLITE === 'true') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
}

// Function to initialize DB schema and fallback to SQLite if MySQL connection fails
async function initDatabase() {
  if (process.env.USE_SQLITE === 'true') {
    return sequelize;
  }

  try {
    // Attempt to create database if not exists
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    return sequelize;
  } catch (err) {
    console.warn('[DB] MySQL connection failed or unavailable. Falling back to local SQLite database:', err.message);
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
    });
    return sequelize;
  }
}

module.exports = { sequelize, initDatabase };
