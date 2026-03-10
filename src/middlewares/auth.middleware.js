// ============================================================
// src/middlewares/auth.middleware.js
//
// QU'EST-CE QU'UN MIDDLEWARE ?
// Un middleware est une fonction qui s'exécute ENTRE la requête HTTP
// et le controller. Il peut :
//   ✅ Laisser passer la requête → next()
//   ❌ Bloquer la requête → res.status(401).json(...)
//   ✏️  Modifier la requête → req.user = ...
//
// CE MIDDLEWARE vérifie que l'utilisateur est bien connecté
// en validant son token JWT avant chaque route protégée.
// ============================================================

// jsonwebtoken = bibliothèque pour créer et vérifier les tokens JWT
// JWT = JSON Web Token : une chaîne encodée qui contient les infos de l'utilisateur
// Exemple de token : "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.abc123"
const jwt = require("jsonwebtoken");

// On déclare la fonction middleware (sera utilisée dans les routes)
function authenticateToken(req, res, next) {

  // Le client envoie le token dans le header HTTP "Authorization"
  // Format attendu : "Bearer eyJhbGciOiJIUzI1NiJ9..."
  // req.headers["authorization"] récupère la valeur de ce header
  const authHeader = req.headers["authorization"];

  // On extrait uniquement le token (on enlève le mot "Bearer ")
  // authHeader.split(" ") découpe en tableau : ["Bearer", "eyJhbG..."]
  // [1] prend le 2ème élément = le token
  // Le && évite un crash si authHeader est undefined (pas de header envoyé)
  const token = authHeader && authHeader.split(" ")[1];

  // Si aucun token n'est fourni → on bloque avec 401 Unauthorized
  // 401 = "Tu n'es pas authentifié"
  if (!token) return res.status(401).json({ message: "Token manquant" });

  // jwt.verify() décode le token ET vérifie sa signature
  // Si le token a été falsifié ou est expiré → err sera défini
  // process.env.JWT_SECRET = la clé secrète dans le fichier .env
  //   (doit être identique à celle utilisée lors de la création du token)
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

    // Si le token est invalide (expiré, falsifié, mauvaise clé...) → 403 Forbidden
    // 403 = "Tu es identifié mais tu n'as pas le droit d'accéder"
    if (err) return res.status(403).json({ message: "Token invalide" });

    // Le token est valide → on attache le contenu décodé à req.user
    // "user" ici = le payload du token, ex: { id: 1, role: "admin", iat: ..., exp: ... }
    // Les controllers pourront utiliser req.user.id, req.user.role, etc.
    req.user = user;

    // next() = on passe au middleware suivant ou au controller
    // Sans next(), la requête resterait bloquée ici indéfiniment
    next();
  });
}

// On exporte la fonction pour l'utiliser dans les fichiers de routes
// Exemple d'utilisation : router.get("/profil", authenticateToken, controller.getProfil)
module.exports = authenticateToken;
