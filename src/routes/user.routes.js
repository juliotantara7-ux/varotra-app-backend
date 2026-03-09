// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

// ✅ IMPORTANT : /change-password doit être déclaré AVANT /:id
// sinon Express interprète "change-password" comme un paramètre :id
router.put("/change-password", authenticateToken, userController.changePassword);

// Routes admin uniquement
router.post("/", authenticateToken, authorizeRole(["admin"]), userController.create);
router.put("/:id", authenticateToken, authorizeRole(["admin"]), userController.update);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), userController.delete);

module.exports = router;
