// src/models/commande.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user.model");

const Commande = sequelize.define("Commande", {
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "en attente" },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 } // total global
});

// Relation : un client passe une commande
Commande.belongsTo(User, { foreignKey: "userId" });

module.exports = Commande;
