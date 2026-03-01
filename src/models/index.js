// src/models/index.js

const Commande = require("./commande.model");
const Vente = require("./vente.model");
const Stock = require("./stock.model");
const CommandeStock = require("./commandeStock.model");
const VenteStock = require("./venteStock.model");

// ======================
// Relations Commande ↔ Stock
// ======================

// Une commande peut contenir plusieurs produits (stocks)
// Un produit peut apparaître dans plusieurs commandes
// => Relation N-N via la table de jointure CommandeStock
Commande.belongsToMany(Stock, { through: CommandeStock });
Stock.belongsToMany(Commande, { through: CommandeStock });

// ======================
// Relations Vente ↔ Stock
// ======================

// Une vente peut contenir plusieurs produits (stocks)
// Un produit peut apparaître dans plusieurs ventes
// => Relation N-N via la table de jointure VenteStock
Vente.belongsToMany(Stock, { through: VenteStock });
Stock.belongsToMany(Vente, { through: VenteStock });

// ======================
// Relations Commande ↔ User et Vente ↔ User
// ======================

// Une commande est passée par un utilisateur (client)
Commande.belongsTo(require("./user.model"), { foreignKey: "userId" });

// Une vente est réalisée par un utilisateur (vendeur)
Vente.belongsTo(require("./user.model"), { foreignKey: "userId" });
