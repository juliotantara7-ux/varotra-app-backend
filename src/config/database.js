const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // ← ajoute le port
    dialect: "mysql", // ou "postgres" si tu choisis PostgreSQL
    logging: false,
  }
);

module.exports = sequelize;
