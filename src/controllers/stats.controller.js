const { Op, fn, col } = require("sequelize");
const Vente = require("../models/vente.model");

// ✅ Chiffre d'affaires journalier
exports.dailyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const total = await Vente.sum("totalPrice", {
      where: {
        date: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    res.json({ date: startOfDay, revenue: total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Chiffre d'affaires mensuel
exports.monthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const total = await Vente.sum("totalPrice", {
      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    res.json({ month: now.getMonth() + 1, year: now.getFullYear(), revenue: total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Chiffre d'affaires annuel
exports.yearlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const total = await Vente.sum("totalPrice", {
      where: {
        date: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });

    res.json({ year: now.getFullYear(), revenue: total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
