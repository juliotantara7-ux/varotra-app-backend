const bcrypt = require("bcrypt");
const User = require("../models/user.model");


exports.create = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.update({ username, email, role });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.destroy();
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Récupérer l'utilisateur connecté
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérifier l'ancien mot de passe
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Ancien mot de passe incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Mot de passe changé avec succès" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

