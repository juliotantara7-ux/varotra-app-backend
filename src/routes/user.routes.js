const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");


router.post("/", authenticateToken, authorizeRole(["admin"]), userController.create);
router.put("/:id", authenticateToken, authorizeRole(["admin"]), userController.update);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), userController.delete);
// Route pour changer le mot de passe (accessible à tous les utilisateurs connectés)
 router.put("/change-password", authenticateToken, userController.changePassword);

module.exports = router;
