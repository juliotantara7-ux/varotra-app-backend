// ============================================================
// src/server.js  (ou app.js)
//
// C'EST LE POINT D'ENTRÉE DE L'APPLICATION.
// Ce fichier :
//   1. Crée l'application Express
//   2. Configure les middlewares globaux (CORS, Helmet, JSON...)
//   3. Connecte à la base de données MySQL
//   4. Synchronise les modèles Sequelize avec la BDD
//   5. Branche toutes les routes de l'API
//   6. Démarre le serveur sur le port 3000
// ============================================================

// Express = framework web pour Node.js
// Il simplifie la création d'un serveur HTTP et la gestion des routes
const express = require("express");

// cors = middleware qui autorise les requêtes cross-origin
// Sans CORS, le navigateur bloquerait les requêtes depuis un autre domaine/port
// Ex: frontend sur localhost:5173 → backend sur localhost:3000 = bloqué sans CORS
const cors = require("cors");

// helmet = middleware de sécurité
// Il ajoute automatiquement des headers HTTP de sécurité pour protéger l'app
// Ex: X-Frame-Options, X-Content-Type-Options, etc.
const helmet = require("helmet");

// path = module Node.js natif pour construire des chemins de fichiers
// Ex: path.join(__dirname, "uploads") → chemin absolu vers le dossier uploads
const path = require("path");

// On importe l'instance de connexion Sequelize à MySQL
// Définie dans config/database.js avec les infos de connexion (.env)
const sequelize = require("./config/database");

// ============================================================
// IMPORT DES MODÈLES
// Ces imports déclenchent la définition des tables Sequelize
// Nécessaires avant d'appeler sequelize.sync()
// ============================================================
const User = require("./models/user.model");
const Stock = require("./models/stock.model");
const Vente = require("./models/vente.model");
const Commande = require("./models/commande.model");

// initAdmin = fonction qui crée le compte admin au 1er démarrage
const initAdmin = require("./initAdmin");

// ⚠️ IMPORTANT : on importe index.js pour déclencher la définition
// de TOUTES les relations entre modèles (belongsToMany, belongsTo...)
// Sans ce require, les relations N-N ne seront pas connues de Sequelize
// et les requêtes avec include/join échoueront
require("./models/index");

// ============================================================
// IMPORT DES ROUTES
// Chaque fichier de routes définit les endpoints d'une ressource
// Ex: user.routes.js → GET /api/users, POST /api/users, etc.
// ============================================================
const userRoutes = require("./routes/user.routes");
const stockRoutes = require("./routes/stock.routes");
const venteRoutes = require("./routes/vente.routes");
const commandeRoutes = require("./routes/commande.routes");
const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes");

// ============================================================
// CRÉATION ET CONFIGURATION DE L'APPLICATION EXPRESS
// ============================================================

// Création de l'instance Express (le "serveur")
const app = express();

// Middleware pour parser automatiquement le body des requêtes en JSON
// Sans ça, req.body serait undefined pour les requêtes POST/PUT
// Ex: { "email": "test@test.com" } → accessible via req.body.email
app.use(express.json());

// ============================================================
// CONFIGURATION CORS
// Autorise le frontend (localhost:5173 = Vite) à appeler cette API
// Sans CORS, le navigateur bloquerait toutes les requêtes cross-origin
// ============================================================
app.use(cors({
  origin: "http://localhost:5173", // URL du frontend autorisé (Vite par défaut)
                                   // En production, remplacer par le vrai domaine
  credentials: false,              // false = pas d'envoi de cookies cross-origin
                                   // Mettre true si on utilise des sessions/cookies
}));

// ============================================================
// CONFIGURATION HELMET (sécurité)
// Helmet ajoute des headers de sécurité mais certains bloquent les images
// ============================================================
app.use(helmet({
  contentSecurityPolicy: false,      // ← Désactivé car il bloquait les images
                                     // En production, mieux vaut le configurer
                                     // plutôt que de le désactiver complètement
  crossOriginResourcePolicy: false,  // ← Désactivé pour autoriser les images
                                     // depuis un port différent (5173 → 3000)
}));

// ============================================================
// SERVIR LES IMAGES STATIQUES
// Express peut servir des fichiers statiques (images, CSS, JS...)
// express.static() = middleware qui retourne les fichiers du dossier
// ============================================================
// Quand une requête arrive sur /uploads/monImage.jpg,
// Express cherche le fichier dans __dirname/uploads/monImage.jpg
// et le retourne directement sans passer par un controller
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Exemple : GET http://localhost:3000/uploads/1749123456-photo.jpg
//           → retourne le fichier uploads/1749123456-photo.jpg

// ============================================================
// CONNEXION À LA BASE DE DONNÉES
// ============================================================
sequelize.authenticate()
  // authenticate() teste juste la connexion (SELECT 1)
  // Si la connexion réussit → on exécute le .then()
  .then(() => {
    console.log("✅ Connexion MySQL réussie");

    // On initialise l'admin après confirmation de la connexion BDD
    // (car initAdmin() fait des requêtes SQL)
    initAdmin();
  })
  // Si la connexion échoue (mauvais host, port, mot de passe...) → erreur
  .catch(err => console.error("❌ Erreur de connexion :", err));

// ============================================================
// SYNCHRONISATION DES MODÈLES AVEC LA BASE DE DONNÉES
// sequelize.sync() crée les tables qui n'existent pas encore
// ============================================================
sequelize.sync()
  // sync() sans option = CREATE TABLE IF NOT EXISTS (ne modifie pas les tables existantes)
  // sync({ force: true })  = DROP + CREATE (⚠️ supprime toutes les données !)
  // sync({ alter: true })  = modifie les tables existantes pour correspondre aux modèles
  //                          (utile en développement, risqué en production)
  .then(() => console.log("✅ Tables synchronisées avec MySQL"))
  .catch(err => console.error("❌ Erreur de synchronisation :", err));

// ============================================================
// BRANCHEMENT DES ROUTES
// app.use(prefixe, routeur) = toutes les routes du fichier
// seront préfixées par le chemin donné
// ============================================================
app.use("/api/users", userRoutes);       // GET/POST/PUT/DELETE /api/users/...
app.use("/api/stocks", stockRoutes);     // GET/POST/PUT/DELETE /api/stocks/...
app.use("/api/ventes", venteRoutes);     // GET/POST            /api/ventes/...
app.use("/api/commandes", commandeRoutes); // GET/POST/PUT       /api/commandes/...
app.use("/api/auth", authRoutes);        // POST               /api/auth/login
app.use("/api/stats", statsRoutes);      // GET                /api/stats/ca

// ============================================================
// ROUTE DE TEST
// Accessible sur GET http://localhost:3000/
// Utile pour vérifier rapidement que le serveur tourne
// ============================================================
app.get("/", (req, res) => {
  res.send("API Node.js avec Sequelize et MySQL fonctionne !");
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// app.listen(port, callback) = démarre l'écoute sur le port donné
// ============================================================
app.listen(3000, () => {
  // Ce message s'affiche dans la console une fois le serveur prêt
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});
