const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const sequelize = require("./config/database");

// Importer les modèles
const User = require("./models/user.model");
const Stock = require("./models/stock.model");
const Vente = require("./models/vente.model");
const Commande = require("./models/commande.model");
const initAdmin = require("./initAdmin");
// Importer les modèles et leurs relations
require("./models/index");

// Importer les routes
const userRoutes = require("./routes/user.routes");
const stockRoutes = require("./routes/stock.routes");
const venteRoutes = require("./routes/vente.routes");
const commandeRoutes = require("./routes/commande.routes");
const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();
app.use(express.json());

// ✅ CORS : autoriser le frontend à accéder aux images
app.use(cors({
  origin: "http://localhost:5173", // adresse de votre frontend Vite
  credentials: false,
}));

// ✅ CORRECTION 1 : Helmet sans Content-Security-Policy
// Helmet bloquait les images cross-origin par défaut
app.use(helmet({
  contentSecurityPolicy: false, // ← désactive le blocage CSP
  crossOriginResourcePolicy: false, // ← autorise les images depuis un autre port
}));

// ✅ CORRECTION 2 : Servir les images depuis la racine du projet
// path.join(__dirname, "uploads") pointe bien vers /votre-projet/uploads/
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test connexion DB
sequelize.authenticate()
  .then(() => {
    console.log("✅ Connexion MySQL réussie");
    initAdmin();
  })
  .catch(err => console.error("❌ Erreur de connexion :", err));

// Synchroniser les modèles avec la base
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Tables synchronisées avec MySQL"))
  .catch(err => console.error("❌ Erreur de synchronisation :", err));

// Brancher les routes
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

// Lancer serveur
app.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});
