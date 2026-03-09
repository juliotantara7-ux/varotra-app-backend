const express = require("express");
const router = express.Router();
const venteController = require("../controllers/vente.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

// Créer une vente (vendeur uniquement)
router.post(
  "/",
  authenticateToken,
  authorizeRole(["vendeur"]),
  venteController.create
);

// Lister les ventes (admin et vendeur)
router.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "vendeur"]),
  venteController.list
);

module.exports = router;
