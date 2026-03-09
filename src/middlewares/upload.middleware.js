const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ CORRECTION : stocker les images à la RACINE du projet (/uploads)
// __dirname ici = dossier middlewares/, donc on remonte d'un niveau
const uploadPath = path.join(__dirname, "..", "uploads");

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // ✅ racine/uploads/
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
