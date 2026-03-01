const Stock = require("../models/stock.model");

exports.create = async (req, res) => {
  try {
    const { productName, quantity, price } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const stock = await Stock.create({ productName, quantity, price, imageUrl });
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.json(stocks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findByPk(id);
    if (!stock) return res.status(404).json({ message: "Produit non trouvé" });
    await stock.destroy();
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
