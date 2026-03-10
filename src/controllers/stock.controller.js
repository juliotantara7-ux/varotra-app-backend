// ============================================================
// src/controllers/stock.controller.js
// Ce fichier gère toutes les actions sur les produits (stocks) :
//   - Créer un produit (avec image)
//   - Modifier un produit
//   - Supprimer un produit
//   - Lister tous les produits
//   - Rechercher un produit par nom
// ============================================================

// Op = opérateurs Sequelize (ici on utilise Op.like pour la recherche textuelle)
const { Op } = require("sequelize");

// On importe directement le modèle Stock (pas besoin des relations ici)
const Stock = require("../models/stock.model");

// ============================================================
// POST /api/stocks
// Créer un nouveau produit avec optionnellement une image
// ============================================================
exports.create = async (req, res) => {
  try {
    // On destructure les champs envoyés dans le body de la requête
    const { productName, price, quantity } = req.body;

    // req.file est injecté par le middleware multer (upload.middleware.js)
    // Si une image a été envoyée → on stocke son chemin relatif
    // Si pas d'image → imageUrl reste null
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

    // Création du produit en base de données avec tous ses champs
    const stock = await Stock.create({ productName, price, quantity, imageUrl });

    // 201 = "Created" : ressource créée avec succès
    res.status(201).json(stock);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur création produit" });
  }
};

// ============================================================
// PUT /api/stocks/:id
// Modifier un produit existant (nom, prix, quantité, image)
// ============================================================
exports.update = async (req, res) => {
  try {
    const { productName, price, quantity } = req.body;

    // On cherche le produit par son ID (passé dans l'URL : /api/stocks/3)
    const stock = await Stock.findByPk(req.params.id);

    // Si le produit n'existe pas → erreur 404
    if (!stock) return res.status(404).json({ message: "Produit introuvable" });

    // Si une nouvelle image a été uploadée, on met à jour le chemin
    if (req.file) stock.imageUrl = `uploads/${req.file.filename}`;

    // On met à jour chaque champ SEULEMENT si une nouvelle valeur est fournie
    // Sinon on garde l'ancienne valeur (|| stock.productName)
    stock.productName = productName || stock.productName;
    stock.price = price || stock.price;
    stock.quantity = quantity || stock.quantity;

    // save() → génère un UPDATE SQL pour sauvegarder les modifications
    await stock.save();

    // On retourne le produit mis à jour
    res.json(stock);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur modification produit" });
  }
};

// ============================================================
// DELETE /api/stocks/:id
// Supprimer un produit par son ID
// ============================================================
exports.delete = async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id);

    // Si le produit n'existe pas → erreur 404
    if (!stock) return res.status(404).json({ message: "Produit introuvable" });

    // destroy() → génère un DELETE SQL
    await stock.destroy();

    res.json({ message: "Produit supprimé" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur suppression produit" });
  }
};

// ============================================================
// GET /api/stocks
// Lister tous les produits, triés du plus récent au plus ancien
// ============================================================
exports.list = async (req, res) => {
  try {
    // findAll() → SELECT * FROM Stocks ORDER BY id DESC
    const stocks = await Stock.findAll({
      order: [["id", "DESC"]] // Tri par ID décroissant (dernier ajouté en premier)
    });

    res.json(stocks);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur récupération produits" });
  }
};

// ============================================================
// GET /api/stocks/search?name=coca
// Rechercher des produits dont le nom contient le mot-clé
// ============================================================
exports.searchByName = async (req, res) => {
  try {
    // Le mot-clé est passé en query string : /api/stocks/search?name=coca
    const { name } = req.query;

    // Validation : le paramètre name est obligatoire
    if (!name) return res.status(400).json({ message: "Nom du produit requis" });

    const stocks = await Stock.findAll({
      where: {
        productName: {
          // Op.like = LIKE en SQL : cherche les produits dont le nom CONTIENT "name"
          // Les % sont des wildcards : %coca% → "coca-cola", "coca", "my coca drink"
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
