const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

// Admin peut créer un produit avec image
router.post("/", authenticateToken, authorizeRole(["admin"]), upload.single("image"), stockController.create);

// Admin peut supprimer un produit
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), stockController.delete);

// Tous les rôles peuvent lister les produits
router.get("/", authenticateToken, authorizeRole(["admin", "client", "vendeur"]), stockController.list);

module.exports = router;
