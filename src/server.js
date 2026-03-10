// ============================================================
// src/server.js  (ou app.js)
//
// Point d’entrée de l’application Express
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const sequelize = require("./config/database");

// Import des modèles
const User = require("./models/user.model");
const Stock = require("./models/stock.model");
const Vente = require("./models/vente.model");
const Commande = require("./models/commande.model");
const initAdmin = require("./initAdmin");
require("./models/index");

// Import des routes
const userRoutes = require("./routes/user.routes");
const stockRoutes = require("./routes/stock.routes");
const venteRoutes = require("./routes/vente.routes");
const commandeRoutes = require("./routes/commande.routes");
const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes");

// Création de l’application
const app = express();
app.use(express.json());

// CORS : autoriser le frontend déployé (Vercel)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: false,
}));

// Helmet : sécurité
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connexion BDD
sequelize.authenticate()
  .then(() => {
    console.log("✅ Connexion MySQL réussie");
    initAdmin();
  })
  .catch(err => console.error("❌ Erreur de connexion :", err));

sequelize.sync()
  .then(() => console.log("✅ Tables synchronisées avec MySQL"))
  .catch(err => console.error("❌ Erreur de synchronisation :", err));

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/ventes", venteRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);

// Route test
app.get("/", (req, res) => {
  res.send("API Node.js avec Sequelize et MySQL fonctionne !");
});

// Démarrage serveur → Railway impose process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
