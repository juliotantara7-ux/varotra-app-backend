const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

// ✅ Chiffre d'affaires journalier
router.get("/daily", authenticateToken, authorizeRole(["admin"]), statsController.dailyRevenue);

// ✅ Chiffre d'affaires mensuel
router.get("/monthly", authenticateToken, authorizeRole(["admin"]), statsController.monthlyRevenue);

// ✅ Chiffre d'affaires annuel
router.get("/yearly", authenticateToken, authorizeRole(["admin"]), statsController.yearlyRevenue);

module.exports = router;
