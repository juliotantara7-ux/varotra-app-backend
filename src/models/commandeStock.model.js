// ============================================================
// src/models/commandeStock.model.js
//
// QU'EST-CE QU'UNE TABLE DE JOINTURE ?
// Quand deux entités ont une relation N-N (plusieurs à plusieurs),
// on a besoin d'une table intermédiaire pour stocker la relation.
//
// Exemple :
//   - Une commande peut contenir plusieurs produits (stocks)
//   - Un produit peut être dans plusieurs commandes
//   → On ne peut pas stocker ça directement dans Commande ou Stock
//   → On crée CommandeStock qui contient : commandeId + stockId + détails
//
// Structure de la table CommandeStocks :
//   | id | CommandeId | StockId | quantity | totalPrice | createdAt | updatedAt |
//   |----|------------|---------|----------|------------|-----------|-----------|
//   |  1 |     1      |    3    |    2     |   29.98    |    ...    |    ...    |
//   |  2 |     1      |    5    |    1     |    9.99    |    ...    |    ...    |
//   |  3 |     2      |    3    |    4     |   59.96    |    ...    |    ...    |
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Ce modèle représente la table de jointure "CommandeStocks"
// Les colonnes CommandeId et StockId sont ajoutées automatiquement par Sequelize
// grâce au belongsToMany défini dans models/index.js
const CommandeStock = sequelize.define("CommandeStock", {

  // Quantité commandée pour CE produit dans CETTE commande
  // allowNull: false → ce champ est OBLIGATOIRE (ne peut pas être vide/null)
  // Équivalent SQL : `quantity INT NOT NULL`
  quantity: { type: DataTypes.INTEGER, allowNull: false },

  // Sous-total pour cette ligne de commande
  // Calculé dans le controller : prix_unitaire × quantité
  // Stocker ce sous-total évite de le recalculer à chaque lecture
  totalPrice: { type: DataTypes.FLOAT, allowNull: false }
});

module.exports = CommandeStock;
