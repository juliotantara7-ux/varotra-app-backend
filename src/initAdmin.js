// src/initAdmin.js
const bcrypt = require("bcrypt");
const User = require("./models/user.model");

async function initAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ where: { role: "admin" } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        username: process.env.ADMIN_USERNAME || "admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: hashedPassword,
        role: "admin"
      });

      console.log("✅ Admin initial créé automatiquement");
    } else {
      console.log("ℹ️ Un admin existe déjà, aucun nouveau créé");
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de l'admin :", err);
  }
}

module.exports = initAdmin;
