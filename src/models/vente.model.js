// ============================================================
// src/models/vente.model.js
//
// Ce modèle représente une vente effectuée par un vendeur.
// Correspond à la table "Ventes" en base de données.
//
// DIFFÉRENCE ENTRE VENTE ET COMMANDE :
//   - COMMANDE : créée par un client, nécessite une validation manuelle
//                Le stock est déduit UNIQUEMENT lors de la validation
//   - VENTE    : créée directement par un vendeur
//                Le stock est déduit IMMÉDIATEMENT à la création
//
// ⚠️ Les relations (belongsToMany avec Stock, belongsTo avec User)
//    sont définies dans models/index.js, pas ici
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vente = sequelize.define("Vente", {

  // Date et heure de la vente
  // DataTypes.NOW = rempli automatiquement avec la date/heure actuelle
  // Utilisée dans stats.controller.js pour filtrer par année/mois
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  // Prix total de la vente (somme de tous les produits vendus)
  // Commence à 0, calculé et mis à jour dans vente.controller.js
  // après avoir parcouru tous les produits de la vente
  totalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }

  // Note : la colonne "userId" (clé étrangère vers Users)
  // est ajoutée automatiquement par Sequelize grâce à :
  // Vente.belongsTo(User, { foreignKey: "userId" }) dans index.js
});

module.exports = Vente;
