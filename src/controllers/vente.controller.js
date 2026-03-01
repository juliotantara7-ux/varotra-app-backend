// src/controllers/vente.controller.js
const Vente = require("../models/vente.model");
const Stock = require("../models/stock.model");

exports.create = async (req, res) => {
  try {
    // Le vendeur envoie un tableau de produits : [{ stockId, quantity }]
    const { products } = req.body;

    // Création de la vente (liée au vendeur connecté)
    const vente = await Vente.create({ userId: req.user.id });

    let totalPrice = 0; // total global de la vente

    // Parcourir chaque produit vendu
    for (let item of products) {
      const stock = await Stock.findByPk(item.stockId);

      // Vérifier que le produit existe et que le stock est suffisant
      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      // Calcul du total pour ce produit
      const itemTotal = stock.price * item.quantity;
      totalPrice += itemTotal;

      // Ajouter la relation dans VenteStock avec quantité et total
      await vente.addStock(stock, {
        through: { quantity: item.quantity, totalPrice: itemTotal }
      });

      // Mise à jour immédiate du stock (vente = sortie directe)
      await stock.update({ quantity: stock.quantity - item.quantity });
    }

    // Mettre à jour le total global de la vente
    await vente.update({ totalPrice });

    res.status(201).json({ vente, totalPrice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    // Récupérer toutes les ventes avec leurs produits associés
    const ventes = await Vente.findAll({ include: Stock });
    res.json(ventes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
