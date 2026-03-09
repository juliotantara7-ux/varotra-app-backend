const Vente = require("../models/vente.model");
const Stock = require("../models/stock.model");

exports.create = async (req, res) => {
  try {
    // Le vendeur envoie un tableau de produits : [{ stockId, quantity }]
    const { products } = req.body;

    // Création de la vente (liée au vendeur connecté)
    const vente = await Vente.create({ userId: req.user.id });

    let totalPrice = 0; // total global de la vente

    for (let item of products) {
      const stock = await Stock.findByPk(item.stockId);

      if (!stock || stock.quantity < item.quantity) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      const itemTotal = stock.price * item.quantity;
      totalPrice += itemTotal;

      await vente.addStock(stock, {
        through: { quantity: item.quantity, totalPrice: itemTotal }
      });

      await stock.update({ quantity: stock.quantity - item.quantity });
    }

    await vente.update({ totalPrice });

    res.status(201).json({ vente, totalPrice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const ventes = await Vente.findAll({ include: Stock });
    res.json(ventes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
