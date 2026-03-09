// src/controllers/commande.controller.js
const sequelize = require("../config/database");
const Commande = require("../models/commande.model");
const Stock = require("../models/stock.model");

exports.create = async (req, res) => {
  // Démarrer une transaction pour garantir l'intégrité des données
  const t = await sequelize.transaction();
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "La liste de produits est vide" });
    }

    // Création de la commande (statut par défaut = "en attente")
    const commande = await Commande.create(
      { userId: req.user.id },
      { transaction: t }
    );

    let totalPrice = 0;

    for (let item of products) {
      const stock = await Stock.findByPk(item.stockId, { transaction: t });

      // Vérifier que le produit existe et que le stock est suffisant
      if (!stock) {
        await t.rollback();
        return res.status(404).json({ message: `Produit ${item.stockId} introuvable` });
      }
      if (stock.quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Stock insuffisant pour le produit : ${stock.productName}` });
      }

      const itemTotal = stock.price * item.quantity;
      totalPrice += itemTotal;

      // Ajouter la relation dans CommandeStock
      await commande.addStock(stock, {
        through: { quantity: item.quantity, totalPrice: itemTotal },
        transaction: t
      });
    }

    // Mettre à jour le total global de la commande
    await commande.update({ totalPrice }, { transaction: t });

    // Tout s'est bien passé : valider la transaction
    await t.commit();

    res.status(201).json({ commande, totalPrice });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.validate = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const commande = await Commande.findByPk(id, {
      include: Stock,
      transaction: t
    });

    if (!commande) {
      await t.rollback();
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    if (commande.status === "validée") {
      await t.rollback();
      return res.status(400).json({ message: "Cette commande est déjà validée" });
    }

    for (let stock of commande.Stocks) {
      const quantityOrdered = stock.CommandeStock.quantity;

      // Vérifier à nouveau le stock au moment de la validation
      if (stock.quantity < quantityOrdered) {
        await t.rollback();
        return res.status(400).json({ message: `Stock insuffisant pour valider : ${stock.productName}` });
      }

      await stock.update(
        { quantity: stock.quantity - quantityOrdered },
        { transaction: t }
      );
    }

    await commande.update({ status: "validée" }, { transaction: t });

    await t.commit();

    res.json({ message: "Commande validée et stock mis à jour" });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};
