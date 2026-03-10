// ============================================================
// src/middlewares/upload.middleware.js
//
// CE MIDDLEWARE gère l'upload de fichiers (images produits)
// Il utilise la bibliothèque "multer" qui intercepte les fichiers
// envoyés en multipart/form-data et les sauvegarde sur le disque.
//
// Après ce middleware, req.file contient les infos du fichier uploadé :
//   req.file.filename  → nom du fichier sauvegardé
//   req.file.path      → chemin complet
//   req.file.mimetype  → type MIME (ex: "image/jpeg")
//
// Exemple d'utilisation dans une route :
//   router.post("/stocks", upload.single("image"), stockController.create)
//   upload.single("image") = attend un seul fichier dans le champ "image"
// ============================================================

// multer = bibliothèque de gestion d'upload de fichiers pour Express
const multer = require("multer");

// path = module Node.js natif pour manipuler les chemins de fichiers
// ex: path.join(), path.extname()
const path = require("path");

// fs = module Node.js natif pour interagir avec le système de fichiers
// ex: créer/supprimer des dossiers, lire des fichiers
const fs = require("fs");

// On construit le chemin ABSOLU du dossier de destination des images
// __dirname = chemin absolu du dossier contenant CE fichier
//             ici : .../api-node/src/middlewares/
// ".."       = on remonte d'un niveau → .../api-node/src/
// "uploads"  = on descend dans le dossier uploads → .../api-node/src/uploads/
//
// ⚠️ Le commentaire dans le code dit "racine du projet"
//    mais avec un seul ".." depuis middlewares/, on arrive dans src/
//    Pour la vraie racine, il faudrait "../.."
const uploadPath = path.join(__dirname, "..", "uploads");

// On vérifie si le dossier uploads/ existe déjà
// fs.existsSync() = vérification SYNCHRONE (bloque jusqu'au résultat)
// Si le dossier n'existe pas → on le crée
if (!fs.existsSync(uploadPath)) {
  // fs.mkdirSync() = création SYNCHRONE du dossier
  // { recursive: true } = crée aussi les dossiers parents manquants si nécessaire
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuration du stockage des fichiers sur le disque
// diskStorage = multer stocke physiquement le fichier sur le disque
// (alternative : memoryStorage = garde le fichier en RAM)
const storage = multer.diskStorage({

  // destination = fonction qui détermine DANS QUEL DOSSIER sauvegarder le fichier
  destination: function (req, file, cb) {
    // cb = callback, convention multer : cb(erreur, chemin)
    // null = pas d'erreur
    // uploadPath = le dossier défini plus haut
    cb(null, uploadPath);
  },

  // filename = fonction qui détermine le NOM du fichier sauvegardé
  filename: function (req, file, cb) {
    // On préfixe le nom original avec un timestamp (millisecondes depuis 1970)
    // Cela garantit l'unicité des noms de fichiers
    // Exemple : "1749123456789-photo-produit.jpg"
    // Sans ce préfixe, deux fichiers "photo.jpg" s'écraseraient mutuellement
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Création de l'instance multer avec notre configuration de stockage
const upload = multer({ storage });

// On exporte l'instance multer configurée
// Dans les routes, on l'utilisera ainsi :
//   upload.single("image")   → 1 seul fichier depuis le champ "image"
//   upload.array("images", 5) → jusqu'à 5 fichiers depuis le champ "images"
//   upload.fields([...])      → plusieurs champs de fichiers différents
module.exports = upload;
