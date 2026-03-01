// src/models/commandeStock.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CommandeStock = sequelize.define("CommandeStock", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false } // prix unitaire * quantité
});

module.exports = CommandeStock;
