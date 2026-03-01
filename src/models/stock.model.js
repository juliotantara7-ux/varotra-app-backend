// src/models/stock.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Stock = sequelize.define("Stock", {
  productName: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true // nom du produit doit être unique
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  price: { 
    type: DataTypes.FLOAT, 
    allowNull: false 
  },
  imageUrl: { 
    type: DataTypes.STRING, 
    allowNull: true // chemin ou URL de l'image
  },
  date: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
});

module.exports = Stock;
