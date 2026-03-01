// src/routes/commande.routes.js

const express = require("express");
const router = express.Router();

// Import du contrôleur qui contient la logique métier
const commandeController = require("../controllers/commande.controller");

// Middleware d’authentification (vérifie le token JWT)
const authenticateToken = require("../middlewares/auth.middleware");

// Middleware d’autorisation (vérifie le rôle de l’utilisateur)
const authorizeRole = require("../middlewares/role.middleware");

// ======================
// Route POST /api/commandes
// ======================
// - Accessible uniquement aux utilisateurs avec rôle "client"
// - Permet de créer une nouvelle commande (statut par défaut = "en attente")
// - Le contrôleur gère la logique : ajout des produits, calcul du total
router.post(
  "/",
  authenticateToken,
  authorizeRole(["client"]),
  commandeController.create
);

// ======================
// Route PUT /api/commandes/:id/validate
// ======================
// - Accessible uniquement aux utilisateurs avec rôle "client"
// - Permet de valider une commande existante
// - Le contrôleur gère la logique : mise à jour du stock, changement du statut en "validée"
router.put(
  "/:id/validate",
  authenticateToken,
  authorizeRole(["client"]),
  commandeController.validate
);

module.exports = router;
