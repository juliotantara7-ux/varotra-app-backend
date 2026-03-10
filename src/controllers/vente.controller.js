// ============================================================
// src/controllers/vente.controller.js
// Ce fichier gère les ventes :
//   - Créer une vente (déduit le stock immédiatement)
//   - Lister toutes les ventes avec leurs produits
//
// Différence avec commande.controller.js :
//   - Une COMMANDE nécessite une validation manuelle avant de déduire le stock
//   - Une VENTE déduit le stock immédiatement à la création
// ============================================================

// On importe directement les modèles (pas via index.js)
const Vente = require("../models/vente.model");
const Stock = require("../models/stock.model");

// ============================================================
// POST /api/ventes
// Créer une nouvelle vente et déduire immédiatement le stock
// ============================================================
exports.create = async (req, res) => {
  try {
    // Format attendu du body : { products: [{ stockId: 1, quantity: 2 }, ...] }
    const { products } = req.body;

    // Création de la vente liée au vendeur connecté
    // req.user.id est récupéré depuis le token JWT (via auth.middleware.js)
    // totalPrice est à 0 au départ, on le met à jour à la fin
    const vente = await Vente.create({ userId: req.user.id });

    // Accumulateur pour le prix total de toute la vente
    let totalPrice = 0;

    // On traite chaque produit de la liste
    for (let item of products) {

      // On récupère le produit en base de données
      const stock = await Stock.findByPk(item.stockId);

      // Double vérification :
      //   - Le produit existe-t-il ?
      //   - La quantité en stock est-elle suffisante ?
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      // Calcul du sous-total pour ce produit
      const itemTotal = stock.price * item.quantity;

      // Ajout au total global
      totalPrice += itemTotal;

      // Création de la relation Vente ↔ Stock dans la table VenteStock
      // addStock() est auto-généré par Sequelize grâce à belongsToMany
      // "through" permet de renseigner les colonnes supplémentaires de la table de jointure
      await vente.addStock(stock, {
        through: {
          quantity: item.quantity,   // Quantité vendue de ce produit
          totalPrice: itemTotal       // Sous-total pour ce produit
        }
      });

      // Déduction immédiate du stock
      // Contrairement aux commandes, ici on déduit TOUT DE SUITE sans validation
      await stock.update({ quantity: stock.quantity - item.quantity });
    }

    // Mise à jour du prix total de la vente une fois tous les produits traités
    await vente.update({ totalPrice });

    // 201 = "Created"
    res.status(201).json({ vente, totalPrice });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// GET /api/ventes
// Lister toutes les ventes avec leurs produits associés
// ============================================================
exports.list = async (req, res) => {
  try {
    // findAll avec include: Stock → Sequelize fait un JOIN automatique
    // Grâce à la relation belongsToMany définie dans models/index.js
    // Résultat : chaque vente contient un tableau "Stocks" avec les produits
    const ventes = await Vente.findAll({ include: Stock });

    res.json(ventes);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
