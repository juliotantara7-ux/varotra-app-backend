const { Op } = require("sequelize");
const Stock = require("../models/stock.model");

// ✅ Créer produit
exports.create = async (req, res) => {
  try {
    const { productName, price, quantity } = req.body;
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

    const stock = await Stock.create({ productName, price, quantity, imageUrl });
    res.status(201).json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur création produit" });
  }
};

// ✅ Modifier produit
exports.update = async (req, res) => {
  try {
    const { productName, price, quantity } = req.body;
    const stock = await Stock.findByPk(req.params.id);

    if (!stock) return res.status(404).json({ message: "Produit introuvable" });

    if (req.file) stock.imageUrl = `uploads/${req.file.filename}`;
    stock.productName = productName || stock.productName;
    stock.price = price || stock.price;
    stock.quantity = quantity || stock.quantity;

    await stock.save();
    res.json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur modification produit" });
  }
};

// ✅ Supprimer produit
exports.delete = async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) return res.status(404).json({ message: "Produit introuvable" });

    await stock.destroy();
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur suppression produit" });
  }
};

// ✅ Lister produits
exports.list = async (req, res) => {
  try {
    const stocks = await Stock.findAll({ order: [["id", "DESC"]] });
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération produits" });
  }
};

// ✅ Rechercher produit par nom
exports.searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Nom du produit requis" });

    const stocks = await Stock.findAll({
      where: {
        productName: {
          [Op.like]: `%${name}%`
        }
      },
      order: [["id", "DESC"]],
    });

    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur recherche produit" });
  }
};
