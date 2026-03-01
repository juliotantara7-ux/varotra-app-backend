const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Test connexion DB
sequelize.authenticate()
  .then(() =>{ console.log("✅ Connexion MySQL réussie") 
    initAdmin(); // Crée l’admin si nécessaire
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

// Route test
app.get("/", (req, res) => {
  res.send("API Node.js avec Sequelize et MySQL fonctionne !");
});

// Lancer serveur
app.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});

