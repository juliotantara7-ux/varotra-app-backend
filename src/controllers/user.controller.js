// ============================================================
// src/controllers/user.controller.js
// Ce fichier gère toutes les actions sur les utilisateurs :
//   - Créer un utilisateur (avec mot de passe hashé)
//   - Modifier un utilisateur
//   - Supprimer un utilisateur
//   - Changer son propre mot de passe
// ============================================================

// bcrypt = bibliothèque pour hasher et vérifier les mots de passe
// Hasher = transformer "monPassword123" en "$2b$10$abc..." (irréversible)
// Ne JAMAIS stocker un mot de passe en clair en base de données !
const bcrypt = require("bcrypt");

// Modèle User pour interagir avec la table Users
const User = require("../models/user.model");

// ============================================================
// POST /api/users
// Créer un nouvel utilisateur (réservé à l'admin)
// ============================================================
exports.create = async (req, res) => {
  try {
    // On récupère les données envoyées dans le body
    const { username, email, password, role } = req.body;

    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 → niveau de complexité du hash (plus c'est élevé, plus c'est sécurisé mais lent)
    // Le résultat est une string hashée du type : "$2b$10$..."
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur en base avec le mot de passe HASHÉ (jamais en clair !)
    const user = await User.create({
      username,
      email,
      password: hashedPassword, // On stocke le hash, pas le mot de passe original
      role                       // ex: "admin", "vendeur", "client"
    });

    res.status(201).json(user);

  } catch (err) {
    // 400 = Bad Request : souvent une contrainte violée (email déjà pris, etc.)
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/users/:id
// Modifier les informations d'un utilisateur (sans changer le mdp)
// ============================================================
exports.update = async (req, res) => {
  try {
    // Récupération de l'ID depuis l'URL (/api/users/5 → id = "5")
    const { id } = req.params;

    // Seuls ces champs sont modifiables via cette route (pas le mot de passe)
    const { username, email, role } = req.body;

    // On cherche l'utilisateur par son ID
    const user = await User.findByPk(id);

    // Si l'utilisateur n'existe pas → erreur 404
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // update() → génère un UPDATE SQL avec uniquement les champs fournis
    await user.update({ username, email, role });

    // On retourne l'utilisateur mis à jour
    res.json(user);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// DELETE /api/users/:id
// Supprimer un utilisateur par son ID
// ============================================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // destroy() → DELETE FROM Users WHERE id = ?
    await user.destroy();

    res.json({ message: "Utilisateur supprimé" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/users/password
// Changer son propre mot de passe (utilisateur connecté)
// L'utilisateur doit fournir son ancien mot de passe pour confirmer
// ============================================================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // req.user.id est injecté par le middleware JWT (auth.middleware.js)
    // C'est l'ID de l'utilisateur actuellement connecté
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // bcrypt.compare() compare le mot de passe tapé avec le hash stocké en BDD
    // Retourne true si ça correspond, false sinon
    // On ne peut PAS faire oldPassword === user.password car user.password est hashé !
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    // Si l'ancien mot de passe est incorrect → on refuse le changement
    if (!validPassword) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    // On hash le nouveau mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // On met à jour uniquement le champ password
    await user.update({ password: hashedPassword });

    res.json({ message: "Mot de passe changé avec succès" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
