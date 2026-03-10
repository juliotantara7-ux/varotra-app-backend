// ============================================================
// src/initAdmin.js
//
// CE FICHIER crée automatiquement le compte administrateur
// au démarrage du serveur si aucun admin n'existe en base.
//
// POURQUOI CE FICHIER EST-IL NÉCESSAIRE ?
// Au tout premier lancement de l'application, la base de données
// est vide. Sans admin, personne ne peut se connecter pour créer
// des utilisateurs. Ce script règle ce problème en bootstrap.
//
// Il est appelé dans server.js après la connexion à la BDD :
//   sequelize.authenticate().then(() => { initAdmin(); })
//
// Les identifiants admin sont définis dans le fichier .env :
//   ADMIN_USERNAME=admin
//   ADMIN_EMAIL=admin@monapp.com
//   ADMIN_PASSWORD=MonMotDePasse123
// ============================================================

// bcrypt pour hasher le mot de passe avant de le stocker
const bcrypt = require("bcrypt");

// On importe le modèle User pour interagir avec la table Users
const User = require("./models/user.model");

// Fonction asynchrone car elle fait des opérations BDD (await)
async function initAdmin() {
  try {

    // On cherche si un utilisateur avec le rôle "admin" existe déjà
    // findOne() = SELECT * FROM Users WHERE role = 'admin' LIMIT 1
    // Retourne l'objet User s'il existe, ou null sinon
    const admin = await User.findOne({ where: { role: "admin" } });

    // CAS 1 : Aucun admin en base → on le crée
    if (!admin) {

      // On hash le mot de passe depuis la variable d'environnement
      // process.env.ADMIN_PASSWORD = valeur définie dans .env
      // 10 = nombre de rounds de salage (coût du hash)
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      // Création de l'utilisateur admin en base de données
      await User.create({
        username: process.env.ADMIN_USERNAME, // ex: "admin"
        email: process.env.ADMIN_EMAIL,       // ex: "admin@monapp.com"
        password: hashedPassword,             // mot de passe hashé (jamais en clair !)
        role: "admin",                        // rôle fixe : administrateur
      });

      // Message de confirmation dans la console du serveur
      console.log("✅ Admin initial créé automatiquement");

    } else {
      // CAS 2 : Un admin existe déjà → on vérifie si son mot de passe est hashé

      // Les mots de passe hashés par bcrypt commencent TOUJOURS par "$2b$"
      // Si ce n'est pas le cas, c'est que le mot de passe a été inséré en clair
      // (par exemple manuellement en BDD) → on le hash maintenant
      if (!admin.password.startsWith("$2b$")) {

        // Le mot de passe n'est pas hashé → on le hash et on le sauvegarde
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        // On modifie directement la propriété de l'instance
        admin.password = hashedPassword;

        // save() = UPDATE Users SET password = ? WHERE id = ?
        await admin.save();

        console.log("✅ Mot de passe admin mis à jour (hashé)");

      } else {
        // CAS 3 : L'admin existe ET son mot de passe est déjà hashé → rien à faire
        console.log("ℹ️ Admin déjà correctement configuré");
      }
    }

  } catch (err) {
    // On affiche l'erreur mais on ne plante pas le serveur
    // Le serveur continuera à démarrer même si cette étape échoue
    console.error("❌ Erreur lors de l'initialisation de l'admin :", err);
  }
}

// On exporte la fonction pour l'appeler dans server.js
module.exports = initAdmin;
