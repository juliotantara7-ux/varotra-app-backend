// ============================================================
// src/services/auth.service.js  (ou src/controllers/auth.controller.js)
//
// CE FICHIER gère l'authentification des utilisateurs :
//   - Vérifier que l'email existe en base
//   - Vérifier que le mot de passe est correct
//   - Générer et retourner un token JWT si tout est bon
//
// FLUX DE CONNEXION :
//   1. Client envoie { email, password }
//   2. On cherche l'utilisateur par email
//   3. On compare le mot de passe avec le hash stocké
//   4. Si tout est bon → on génère un token JWT
//   5. Le client stocke ce token et l'envoie dans chaque requête suivante
// ============================================================

// jsonwebtoken = bibliothèque pour créer et signer des tokens JWT
const jwt = require("jsonwebtoken");

// bcrypt = bibliothèque pour comparer un mot de passe avec son hash
// (le hash est stocké en BDD, on ne peut pas comparer directement)
const bcrypt = require("bcrypt");

// On importe directement le modèle User (pas besoin des relations ici)
const User = require("../models/user.model");

// ============================================================
// POST /api/auth/login
// Connecte un utilisateur et retourne un token JWT
// ============================================================
exports.login = async (req, res) => {
  try {
    // On récupère les identifiants envoyés dans le body de la requête
    const { email, password } = req.body;

    // On cherche l'utilisateur en base par son email
    // findOne() = SELECT * FROM Users WHERE email = ? LIMIT 1
    // { where: { email } } est une syntaxe raccourcie pour { where: { email: email } }
    const user = await User.findOne({ where: { email } });

    // Si aucun utilisateur trouvé avec cet email → erreur 404
    // ⚠️ Pour la sécurité, certains préfèrent répondre 401 (sans préciser si c'est
    //    l'email ou le mot de passe qui est faux) pour éviter l'énumération d'emails
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // bcrypt.compare(motDePasseSaisi, hashStockeEnBDD)
    // Retourne true si le mot de passe correspond au hash, false sinon
    // On ne peut PAS faire password === user.password car user.password est un hash !
    const validPassword = await bcrypt.compare(password, user.password);

    // Si le mot de passe ne correspond pas → 401 Unauthorized
    if (!validPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // ✅ Email et mot de passe corrects → on génère le token JWT
    //
    // jwt.sign(payload, secret, options)
    //   payload  = les données à encoder dans le token (accessibles après vérification)
    //   secret   = clé secrète pour signer le token (dans .env)
    //   options  = configuration du token
    const token = jwt.sign(
      {
        // PAYLOAD : informations embarquées dans le token
        // Ces données seront disponibles dans req.user après vérification par auth.middleware.js
        id: user.id,             // Identifiant unique de l'utilisateur
        role: user.role,         // Rôle ("admin", "vendeur", "client") → utilisé par role.middleware.js
        username: user.username, // Nom d'affichage → utile pour le frontend
        // ⚠️ Ne JAMAIS mettre le mot de passe ou des données sensibles dans le payload !
        // Le payload est encodé en base64 et lisible sans la clé secrète
      },
      process.env.JWT_SECRET,   // Clé secrète stockée dans le fichier .env
                                // JAMAIS écrire la clé directement ici en dur !
      { expiresIn: "1h" }       // Le token expirera après 1 heure
                                // Après expiration, le client devra se reconnecter
    );

    // On retourne uniquement le token au client
    // Le client le stockera (localStorage, cookie, etc.) et l'enverra
    // dans chaque requête : Authorization: Bearer <token>
    res.json({ token });

  } catch (err) {
    // 500 = Internal Server Error (erreur inattendue côté serveur)
    res.status(500).json({ error: err.message });
  }
};
