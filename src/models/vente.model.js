// src/models/vente.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ⚠️ Ne pas définir les relations ici — elles sont toutes dans models/index.js
const Vente = sequelize.define("Vente", {
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 }
});

module.exports = Vente;
