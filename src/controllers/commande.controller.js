// ============================================================
// src/controllers/commande.controller.js
// Ce fichier gère toutes les actions liées aux commandes :
//   - Créer une commande (avec vérification du stock)
//   - Valider une commande (déduction du stock réelle)
// ============================================================

// On importe sequelize pour pouvoir démarrer des TRANSACTIONS
// Une transaction = un groupe d'opérations qui doivent toutes réussir ou toutes échouer
const sequelize = require("../config/database");

// On importe directement les modèles (pas via index.js ici)
// car ce controller n'a pas besoin des relations complexes
const Commande = require("../models/commande.model");
const Stock = require("../models/stock.model");

// ============================================================
// POST /api/commandes
// Créer une nouvelle commande avec une liste de produits
// ============================================================
exports.create = async (req, res) => {

  // On démarre une TRANSACTION pour protéger l'intégrité des données
  // Si une étape échoue, toutes les modifications seront annulées (rollback)
  const t = await sequelize.transaction();

  try {
    // On récupère la liste des produits envoyés par le client
    // Format attendu : [{ stockId: 1, quantity: 3 }, { stockId: 2, quantity: 1 }]
    const { products } = req.body;

    // Vérification : la liste de produits ne doit pas être vide
    if (!products || products.length === 0) {
      await t.rollback(); // On annule la transaction avant de retourner l'erreur
      return res.status(400).json({ message: "La liste de produits est vide" });
    }

    // Création de la commande en base de données
    // userId est récupéré depuis le token JWT (ajouté par le middleware auth)
    // { transaction: t } = cette opération fait partie de notre transaction
    const commande = await Commande.create(
      { userId: req.user.id },
      { transaction: t }
    );

    // Variable pour accumuler le prix total de la commande
    let totalPrice = 0;

    // On parcourt chaque produit de la liste
    for (let item of products) {

      // On cherche le produit en base de données par son ID
      // { transaction: t } = on utilise la même transaction (données cohérentes)
      const stock = await Stock.findByPk(item.stockId, { transaction: t });

      // Si le produit n'existe pas en base → erreur 404
      if (!stock) {
        await t.rollback(); // Annulation de tout ce qui a été fait avant
        return res.status(404).json({ message: `Produit ${item.stockId} introuvable` });
      }

      // Si la quantité disponible est insuffisante → erreur 400
      if (stock.quantity < item.quantity) {
        await t.rollback(); // Annulation de tout ce qui a été fait avant
        return res.status(400).json({ message: `Stock insuffisant pour le produit : ${stock.productName}` });
      }

      // Calcul du sous-total pour ce produit (prix unitaire × quantité)
      const itemTotal = stock.price * item.quantity;

      // On ajoute ce sous-total au total global
      totalPrice += itemTotal;

      // On crée la relation entre la commande et ce produit
      // addStock() est généré automatiquement par Sequelize grâce à belongsToMany
      // "through" permet de renseigner les colonnes de la table de jointure CommandeStock
      await commande.addStock(stock, {
        through: { quantity: item.quantity, totalPrice: itemTotal },
        transaction: t // Toujours dans la même transaction
      });
    }

    // On met à jour le prix total global de la commande
    await commande.update({ totalPrice }, { transaction: t });

    // Tout s'est bien passé → on VALIDE la transaction (les données sont sauvegardées)
    await t.commit();

    // On retourne la commande créée avec son total
    res.status(201).json({ commande, totalPrice });

  } catch (err) {
    // En cas d'erreur inattendue → on annule TOUT (rollback)
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/commandes/:id/validate
// Valider une commande existante → décrémente réellement le stock
// ============================================================
exports.validate = async (req, res) => {

  // Nouvelle transaction pour cette opération aussi
  const t = await sequelize.transaction();

  try {
    // Récupération de l'ID de la commande depuis l'URL (/api/commandes/5/validate → id = 5)
    const { id } = req.params;

    // On cherche la commande ET ses produits associés (include: Stock)
    // Sequelize va faire un JOIN automatiquement grâce aux relations définies dans index.js
    const commande = await Commande.findByPk(id, {
      include: Stock, // Charge aussi les stocks liés à cette commande
      transaction: t
    });

    // Si la commande n'existe pas → erreur 404
    if (!commande) {
      await t.rollback();
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // On interdit de valider une commande déjà validée
    if (commande.status === "validée") {
      await t.rollback();
      return res.status(400).json({ message: "Cette commande est déjà validée" });
    }

    // On parcourt tous les produits de la commande
    for (let stock of commande.Stocks) {

      // La quantité commandée est stockée dans la table de jointure CommandeStock
      // Sequelize la rend accessible via stock.CommandeStock.quantity
      const quantityOrdered = stock.CommandeStock.quantity;

      // Vérification une dernière fois que le stock est suffisant
      // (il a pu changer depuis la création de la commande)
      if (stock.quantity < quantityOrdered) {
        await t.rollback();
        return res.status(400).json({ message: `Stock insuffisant pour valider : ${stock.productName}` });
      }

      // On décrémente réellement la quantité en stock
      await stock.update(
        { quantity: stock.quantity - quantityOrdered },
        { transaction: t }
      );
    }

    // On passe le statut de la commande à "validée"
    await commande.update({ status: "validée" }, { transaction: t });

    // Tout s'est bien passé → on valide la transaction
    await t.commit();

    res.json({ message: "Commande validée et stock mis à jour" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};
