// ============================================================
// src/models/commande.model.js
//
// QU'EST-CE QU'UN MODÈLE SEQUELIZE ?
// Un modèle = la représentation JavaScript d'une table SQL.
// Sequelize crée automatiquement la table en base si elle n'existe pas
// (avec sequelize.sync()) et génère toutes les requêtes SQL.
//
// Ce modèle représente la table "Commandes" en base de données.
// ⚠️ Les relations (belongsToMany, etc.) sont dans models/index.js
// ============================================================

// DataTypes = objet contenant tous les types de données Sequelize
// (STRING, INTEGER, FLOAT, DATE, BOOLEAN, TEXT, etc.)
const { DataTypes } = require("sequelize");

// On importe l'instance de connexion à la base de données
// C'est la même instance partagée dans toute l'application
const sequelize = require("../config/database");

// sequelize.define("NomDuModèle", { définition des colonnes })
// "Commande" → Sequelize créera la table "Commandes" (il pluralise automatiquement)
// Sequelize ajoute aussi automatiquement les colonnes : id, createdAt, updatedAt
const Commande = sequelize.define("Commande", {

  // Colonne "date" de type DATE
  // defaultValue: DataTypes.NOW → si aucune valeur fournie, utilise la date/heure actuelle
  // Équivalent SQL : `date DATETIME DEFAULT CURRENT_TIMESTAMP`
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  // Colonne "status" de type VARCHAR
  // Représente l'état de la commande dans son cycle de vie
  // Valeurs possibles : "en attente" (défaut) ou "validée"
  status: { type: DataTypes.STRING, defaultValue: "en attente" },

  // Colonne "totalPrice" de type FLOAT (décimal)
  // Commence à 0 et est mis à jour dans le controller après ajout des produits
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 }
});

// Export du modèle pour l'utiliser dans d'autres fichiers
module.exports = Commande;
