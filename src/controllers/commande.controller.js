// src/controllers/commande.controller.js
const Commande = require("../models/commande.model");
const Stock = require("../models/stock.model");

exports.create = async (req, res) => {
  try {
    // Le client envoie un tableau de produits : [{ stockId, quantity }]
    const { products } = req.body;

    // Création de la commande (statut par défaut = "en attente")
    const commande = await Commande.create({ userId: req.user.id });

    let totalPrice = 0; // total global de la commande

    // Parcourir chaque produit demandé
    for (let item of products) {
      const stock = await Stock.findByPk(item.stockId);

      // Vérifier que le produit existe et que le stock est suffisant
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      // Calcul du total pour ce produit
      const itemTotal = stock.price * item.quantity;
      totalPrice += itemTotal;

      // Ajouter la relation dans CommandeStock avec quantité et total
      await commande.addStock(stock, {
        through: { quantity: item.quantity, totalPrice: itemTotal }
      });
    }

    // Mettre à jour le total global de la commande
    await commande.update({ totalPrice });

    res.status(201).json({ commande, totalPrice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la commande avec ses produits liés
    const commande = await Commande.findByPk(id, { include: Stock });
    if (!commande) return res.status(404).json({ message: "Commande non trouvée" });

    // Parcourir chaque produit lié à la commande
    for (let stock of commande.Stocks) {
      // Récupérer la quantité commandée depuis la table de jointure
      const quantityOrdered = stock.CommandeStock.quantity;

      // Décrémenter le stock disponible
      await stock.update({ quantity: stock.quantity - quantityOrdered });
    }

    // Mettre à jour le statut de la commande
    await commande.update({ status: "validée" });

    res.json({ message: "Commande validée et stock mis à jour" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
