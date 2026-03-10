// ============================================================
// src/models/stock.model.js
//
// Ce modèle représente un produit disponible en stock.
// Correspond à la table "Stocks" en base de données.
//
// Ce modèle est central dans l'application :
//   - Les commandes référencent des stocks (via CommandeStock)
//   - Les ventes référencent des stocks (via VenteStock)
//   - Le controller stock.controller.js gère le CRUD de ces produits
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Stock = sequelize.define("Stock", {

  // Nom du produit
  // allowNull: false → obligatoire, ne peut pas être null ou vide
  // unique: true     → deux produits ne peuvent pas avoir le même nom
  //                    Sequelize créera un index UNIQUE sur cette colonne
  productName: {
    type: DataTypes.STRING,   // VARCHAR(255) en SQL
    allowNull: false,
    unique: true
  },

  // Quantité actuellement disponible en stock
  // INTEGER = nombre entier (pas de décimales pour une quantité)
  // Mis à jour automatiquement lors des ventes (stock.controller.js)
  quantity: {
    type: DataTypes.INTEGER,  // INT en SQL
    allowNull: false
  },

  // Prix unitaire du produit
  // FLOAT = nombre décimal (ex: 9.99, 149.90)
  price: {
    type: DataTypes.FLOAT,    // FLOAT en SQL
    allowNull: false
  },

  // Chemin relatif vers l'image du produit
  // Exemple de valeur stockée : "uploads/1749123456-monImage.jpg"
  // allowNull: true → l'image est OPTIONNELLE (un produit peut ne pas avoir d'image)
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true           // null = pas d'image pour ce produit
  },

  // Date d'ajout du produit dans le stock
  // DataTypes.NOW = valeur automatique = date/heure actuelle à la création
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Sequelize ajoute automatiquement ces colonnes supplémentaires :
//   - id          (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
//   - createdAt   (DATETIME, rempli à la création)
//   - updatedAt   (DATETIME, mis à jour à chaque modification)

module.exports = Stock;
