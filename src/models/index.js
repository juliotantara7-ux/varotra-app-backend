// ============================================================
// src/models/index.js
//
// CE FICHIER A DEUX RÔLES ESSENTIELS :
//
// 1. DÉFINIR TOUTES LES RELATIONS entre les modèles
//    Les relations (associations) Sequelize DOIVENT être définies
//    dans un seul fichier centralisé pour éviter les erreurs de
//    dépendances circulaires (A importe B qui importe A = boucle infinie)
//
// 2. EXPORTER TOUS LES MODÈLES
//    Les controllers importent leurs modèles depuis ce fichier unique :
//    const { Vente, Stock } = require("../models/index")
//
// TYPES DE RELATIONS SEQUELIZE :
//   - belongsTo       → clé étrangère du côté "belongsTo"  (1-N côté enfant)
//   - hasMany         → l'inverse de belongsTo              (1-N côté parent)
//   - belongsToMany   → relation N-N via table de jointure
// ============================================================

// Import de tous les modèles de l'application
const Commande = require("./commande.model");
const Vente = require("./vente.model");
const Stock = require("./stock.model");
const CommandeStock = require("./commandeStock.model"); // Table de jointure Commande ↔ Stock
const VenteStock = require("./venteStock.model");       // Table de jointure Vente ↔ Stock
const User = require("./user.model");

// ============================================================
// RELATION : Commande ↔ Stock (Many-to-Many / N-N)
//
// belongsToMany génère automatiquement les méthodes utilitaires :
//   commande.addStock(stock)       → ajoute un stock à la commande
//   commande.getStocks()           → récupère tous les stocks de la commande
//   commande.setStocks([...])      → remplace les stocks de la commande
//   stock.getCommandes()           → récupère toutes les commandes de ce stock
//
// { through: CommandeStock } = la table de jointure utilisée pour cette relation
// Sequelize y ajoutera automatiquement les colonnes CommandeId et StockId
// ============================================================

// Une commande peut contenir plusieurs stocks
Commande.belongsToMany(Stock, { through: CommandeStock });

// Un stock peut apparaître dans plusieurs commandes (relation inverse)
Stock.belongsToMany(Commande, { through: CommandeStock });

// Relations directes sur la table de jointure elle-même
// Nécessaires pour pouvoir faire des requêtes sur CommandeStock directement
// Ex: CommandeStock.findAll({ include: Stock })
CommandeStock.belongsTo(Commande); // CommandeStock a une colonne CommandeId
CommandeStock.belongsTo(Stock);    // CommandeStock a une colonne StockId

// ============================================================
// RELATION : Vente ↔ Stock (Many-to-Many / N-N)
//
// Même logique que Commande ↔ Stock
// Une vente peut contenir plusieurs produits
// Un produit peut apparaître dans plusieurs ventes
// ============================================================

Vente.belongsToMany(Stock, { through: VenteStock });
Stock.belongsToMany(Vente, { through: VenteStock });

// ⚠️ IMPORTANT : ces relations directes sont INDISPENSABLES
// pour que stats.controller.js puisse faire :
// VenteStock.findAll({ include: Stock }) → JOIN sur la table Stock
VenteStock.belongsTo(Vente); // VenteStock a une colonne VenteId
VenteStock.belongsTo(Stock); // VenteStock a une colonne StockId

// ============================================================
// RELATION : User → Commande / User → Vente (One-to-Many / 1-N)
//
// Un utilisateur peut avoir plusieurs commandes
// Une commande appartient à un seul utilisateur
//
// foreignKey: "userId" → nom explicite de la colonne clé étrangère
// Sans foreignKey, Sequelize utiliserait "UserId" (avec majuscule)
// ============================================================

// La table Commandes aura une colonne "userId" qui référence Users.id
Commande.belongsTo(User, { foreignKey: "userId" });

// La table Ventes aura une colonne "userId" qui référence Users.id
Vente.belongsTo(User, { foreignKey: "userId" });

// ============================================================
// EXPORT DE TOUS LES MODÈLES
//
// ⚠️ CRITIQUE : sans ce module.exports, require("../models/index")
// retourne un objet vide {} et tous les modèles sont undefined
// dans les controllers → erreur "Cannot read properties of undefined"
// ============================================================
module.exports = {
  Commande,
  Vente,
  Stock,
  CommandeStock,
  VenteStock,
  User,
};
