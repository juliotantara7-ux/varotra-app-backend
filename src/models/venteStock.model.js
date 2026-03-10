// ============================================================
// src/models/venteStock.model.js
//
// Table de jointure entre Vente et Stock (relation N-N)
//
// POURQUOI CETTE TABLE EXISTE-T-ELLE ?
// Une vente contient plusieurs produits, et un produit peut
// apparaître dans plusieurs ventes → relation Many-to-Many (N-N)
// On ne peut pas stocker ça directement dans Vente ou Stock.
// Cette table intermédiaire stocke chaque "ligne" d'une vente.
//
// Structure de la table VenteStocks :
//   | id | VenteId | StockId | quantity | totalPrice | createdAt | updatedAt |
//   |----|---------|---------|----------|------------|-----------|-----------|
//   |  1 |    1    |    2    |    3     |   29.97    |    ...    |    ...    |
//   |  2 |    1    |    5    |    1     |    9.99    |    ...    |    ...    |
//   |  3 |    2    |    2    |    2     |   19.98    |    ...    |    ...    |
//
// Les colonnes VenteId et StockId sont ajoutées automatiquement
// par Sequelize grâce au belongsToMany défini dans models/index.js
//
// Utilisée dans stats.controller.js pour calculer le CA par produit :
//   VenteStock.findAll({ include: Stock, group: ["Stock.id"], ... })
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VenteStock = sequelize.define("VenteStock", {

  // Quantité vendue de CE produit dans CETTE vente
  // Ex: si on a vendu 3 bouteilles d'eau → quantity = 3
  // allowNull: false → obligatoire (on ne peut pas vendre 0 ou null produits)
  quantity: {
    type: DataTypes.INTEGER,  // Nombre entier (pas de 0.5 produit)
    allowNull: false
  },

  // Sous-total pour cette ligne de vente
  // Calculé dans vente.controller.js : stock.price * item.quantity
  // Ex: 3 bouteilles à 1.50€ → totalPrice = 4.50
  // Stocker ce sous-total évite de le recalculer à chaque requête de stats
  totalPrice: {
    type: DataTypes.FLOAT,    // Nombre décimal pour les centimes
    allowNull: false
  }
});

module.exports = VenteStock;
