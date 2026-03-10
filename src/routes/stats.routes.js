// src/routes/stats.routes.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

// Accessible aux admin et vendeurs uniquement
const guard = [authenticateToken, authorizeRole(["admin", "vendeur"])];

// CA global + mensuel + annuel + par produit
router.get("/ca", ...guard, statsController.getCA);

// CA mensuel d'une année précise
router.get("/ca/annee/:annee", ...guard, statsController.getCAByAnnee);

module.exports = router;
