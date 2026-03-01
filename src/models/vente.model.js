// src/models/vente.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");

const Vente = sequelize.define("Vente", {
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 } // total global de la vente
});

// Relation : un vendeur fait une vente
Vente.belongsTo(User, { foreignKey: "userId" });

module.exports = Vente;
