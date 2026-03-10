// ============================================================
// src/models/user.model.js
//
// Ce modèle représente un utilisateur de l'application.
// Correspond à la table "Users" en base de données.
//
// Les utilisateurs ont des rôles qui déterminent leurs accès :
//   - "admin"   → accès total (gestion users, stats, validation commandes...)
//   - "vendeur" → peut créer des ventes, voir les stocks
//   - "client"  → peut passer des commandes
//
// ⚠️ Le mot de passe est toujours stocké HASHÉ (jamais en clair)
//    Le hashing se fait dans user.controller.js avec bcrypt
// ============================================================

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {

  // Nom d'utilisateur affiché dans l'application
  // unique: true → deux utilisateurs ne peuvent pas avoir le même username
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true        // Crée un index UNIQUE en base → erreur si doublon
  },

  // Adresse email (utilisée pour la connexion dans auth.controller.js)
  // unique: true → un email ne peut être associé qu'à un seul compte
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  // Mot de passe HASHÉ par bcrypt
  // Exemple de valeur stockée : "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  // allowNull: false → obligatoire, tout utilisateur doit avoir un mot de passe
  // ⚠️ Ne JAMAIS stocker le mot de passe en clair (ex: "monPassword123")
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // Rôle de l'utilisateur → détermine ses permissions dans l'application
  // Valeurs attendues : "admin", "vendeur", "client"
  // Vérifié par role.middleware.js sur chaque route protégée
  // Note : on pourrait utiliser DataTypes.ENUM("admin","vendeur","client")
  //        pour forcer les valeurs, mais STRING est plus flexible
  role: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = User;
