// src/models/venteStock.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VenteStock = sequelize.define("VenteStock", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false } // prix unitaire * quantité
});

module.exports = VenteStock;
