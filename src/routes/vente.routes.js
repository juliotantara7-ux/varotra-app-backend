// src/routes/vente.routes.js

const express = require("express");
const router = express.Router();

// Import du contrôleur qui contient la logique métier
const venteController = require("../controllers/vente.controller");

// Middleware d’authentification (vérifie le token JWT)
const authenticateToken = require("../middlewares/auth.middleware");

// Middleware d’autorisation (vérifie le rôle de l’utilisateur)
const authorizeRole = require("../middlewares/role.middleware");

// ======================
// Route POST /api/ventes
// ======================
// - Accessible uniquement aux utilisateurs avec rôle "vendeur"
// - Permet de créer une nouvelle vente
// - Le contrôleur gère la logique : ajout des produits, calcul du total, mise à jour du stock
router.post(
  "/",
  authenticateToken,
  authorizeRole(["vendeur"]),
  venteController.create
);

// ======================
// Route GET /api/ventes
// ======================
// - Accessible aux utilisateurs avec rôle "admin" ou "vendeur"
// - Permet de lister toutes les ventes existantes
// - Le contrôleur gère la logique : récupération des ventes avec leurs produits associés
router.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "vendeur"]),
  venteController.list
);

module.exports = router;
