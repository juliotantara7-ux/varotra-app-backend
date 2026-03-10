// ============================================================
// src/middlewares/role.middleware.js
//
// CE MIDDLEWARE vérifie que l'utilisateur connecté a le bon rôle
// pour accéder à une route.
//
// Il s'utilise TOUJOURS après authenticateToken (auth.middleware.js)
// car il a besoin de req.user qui est rempli par ce dernier.
//
// Exemple d'utilisation dans une route :
//   router.delete("/users/:id",
//     authenticateToken,              ← vérifie le token JWT
//     authorizeRole(["admin"]),       ← vérifie que c'est un admin
//     userController.delete           ← exécute le controller
//   )
// ============================================================

// authorizeRole est une FACTORY FUNCTION :
// c'est une fonction qui RETOURNE une autre fonction (le vrai middleware)
// On l'appelle avec le tableau des rôles autorisés en paramètre
// Exemple : authorizeRole(["admin", "vendeur"])
function authorizeRole(roles) {

  // On retourne le vrai middleware (fonction avec req, res, next)
  return (req, res, next) => {

    // Double vérification :
    // 1. req.user existe (sinon authenticateToken n'a pas été appelé avant)
    // 2. Le rôle de l'utilisateur est dans la liste des rôles autorisés
    //    roles.includes(req.user.role) → ex: ["admin"].includes("vendeur") → false
    if (!req.user || !roles.includes(req.user.role)) {

      // 403 Forbidden = l'utilisateur est connecté mais n'a pas les droits suffisants
      return res.status(403).json({ message: "Accès interdit" });
    }

    // Le rôle est autorisé → on laisse passer vers le controller
    next();
  };
}

// On exporte la factory function
module.exports = authorizeRole;
