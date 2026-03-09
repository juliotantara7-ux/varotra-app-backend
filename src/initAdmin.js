const bcrypt = require("bcrypt");
const User = require("./models/user.model");

async function initAdmin() {
  try {
    const admin = await User.findOne({ where: { role: "admin" } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin initial créé automatiquement");
    } else {
      // Vérifier si password non hashé
      if (!admin.password.startsWith("$2b$")) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        admin.password = hashedPassword;
        await admin.save();
        console.log("✅ Mot de passe admin mis à jour (hashé)");
      } else {
        console.log("ℹ️ Admin déjà correctement configuré");
      }
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de l'admin :", err);
  }
}

module.exports = initAdmin;