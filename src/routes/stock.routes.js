const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");

const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

// créer produit
router.post(
  "/",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  stockController.create
);

// modifier produit
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  stockController.update
);

// supprimer produit
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  stockController.delete
);

// liste produits
router.get(
  "/",
  authenticateToken,
  authorizeRole(["admin", "client", "vendeur"]),
  stockController.list
);

// ✅ recherche par nom
router.get(
  "/search",
  authenticateToken,
  authorizeRole(["admin", "client", "vendeur"]),
  stockController.searchByName
);

module.exports = router;
