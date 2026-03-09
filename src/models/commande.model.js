// src/models/commande.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ⚠️ Ne pas définir les relations ici — elles sont toutes dans models/index.js
const Commande = sequelize.define("Commande", {
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "en attente" },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 }
});

module.exports = Commande;
