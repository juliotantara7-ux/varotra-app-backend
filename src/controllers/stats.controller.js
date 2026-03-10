// ============================================================
// src/controllers/stats.controller.js
// Ce fichier gère les statistiques de chiffre d'affaires (CA) :
//   - CA global (toutes ventes confondues)
//   - CA par année
//   - CA mensuel (pour l'année en cours ou une année précise)
//   - CA par produit
// ============================================================

// On importe les modèles depuis index.js (qui gère toutes les relations)
// Destructuration : on ne prend que ce dont on a besoin
const { Vente, VenteStock, Stock } = require("../models/index");

// Instance de la connexion à la base de données (pas utilisée directement ici,
// mais bonne pratique de l'importer si on en a besoin plus tard)
const sequelize = require("../config/database");

// Op       = opérateurs Sequelize (ex: Op.between pour "ENTRE deux dates")
// fn       = appeler une fonction SQL (ex: fn("SUM", ...) → SUM(...))
// col      = référencer une colonne SQL (ex: col("totalPrice") → `totalPrice`)
// literal  = écrire du SQL brut quand Sequelize ne suffit pas
const { Op, fn, col, literal } = require("sequelize");

// ============================================================
// GET /api/stats/ca
// Retourne toutes les statistiques de CA en une seule requête
// ============================================================
exports.getCA = async (req, res) => {
  try {

    // Récupère l'année actuelle (ex: 2025) pour filtrer les données mensuelles
    const anneeActuelle = new Date().getFullYear();

    // ----------------------------------------------------------
    // 1. CA GLOBAL : somme de tous les totalPrice de toutes les ventes
    // Vente.sum("totalPrice") génère : SELECT SUM(totalPrice) FROM Ventes
    // Si aucune vente → retourne null → on force 0 avec || 0
    // ----------------------------------------------------------
    const caGlobal = (await Vente.sum("totalPrice")) || 0;

    // ----------------------------------------------------------
    // 2. CA PAR ANNÉE : groupe les ventes par année
    // Génère : SELECT YEAR(date) AS annee, SUM(totalPrice) AS ca
    //          FROM Ventes GROUP BY YEAR(date) ORDER BY annee ASC
    // ----------------------------------------------------------
    const caAnnuel = await Vente.findAll({
      attributes: [
        // fn("YEAR", col("date")) → appelle la fonction SQL YEAR() sur la colonne date
        // Le deuxième argument "annee" est l'alias (AS annee)
        [fn("YEAR", col("date")), "annee"],

        // fn("SUM", col("totalPrice")) → SUM(totalPrice) AS ca
        [fn("SUM", col("totalPrice")), "ca"],
      ],

      // GROUP BY YEAR(date) → un résultat par année
      group: [fn("YEAR", col("date"))],

      // ORDER BY annee ASC → du plus ancien au plus récent
      // literal("annee") permet d'utiliser l'alias dans ORDER BY
      order: [[literal("annee"), "ASC"]],

      // raw: true → retourne des objets JS simples, pas des instances Sequelize
      // Plus léger et pratique pour la lecture
      raw: true,
    });

    // ----------------------------------------------------------
    // 3. CA MENSUEL pour l'année en cours (12 mois, même si certains = 0)
    // Génère : SELECT MONTH(date) AS mois, SUM(totalPrice) AS ca
    //          FROM Ventes WHERE date BETWEEN '2025-01-01' AND '2025-12-31'
    //          GROUP BY MONTH(date) ORDER BY mois ASC
    // ----------------------------------------------------------
    const caMensuelRaw = await Vente.findAll({
      attributes: [
        // MONTH(date) → numéro du mois (1 à 12)
        [fn("MONTH", col("date")), "mois"],
        [fn("SUM", col("totalPrice")), "ca"],
      ],
      where: {
        date: {
          // Op.between → WHERE date BETWEEN debut AND fin
          [Op.between]: [
            new Date(`${anneeActuelle}-01-01T00:00:00`), // 1er janvier à minuit
            new Date(`${anneeActuelle}-12-31T23:59:59`), // 31 décembre à 23h59
          ],
        },
      },
      group: [fn("MONTH", col("date"))],
      order: [[literal("mois"), "ASC"]],
      raw: true,
    });

    // On construit un tableau de 12 entrées (une par mois)
    // Si un mois n'a pas de vente, on met ca: 0
    const caMensuel = Array.from({ length: 12 }, (_, i) => {
      // i va de 0 à 11, donc le numéro de mois = i + 1
      const found = caMensuelRaw.find((r) => parseInt(r.mois) === i + 1);
      return {
        mois: i + 1,                              // Numéro du mois (1 = Janvier...)
        ca: found ? parseFloat(found.ca) : 0      // CA du mois ou 0 si aucune vente
      };
    });

    // ----------------------------------------------------------
    // 4. CA PAR PRODUIT : CA + quantité vendue, triés par CA décroissant
    // On interroge VenteStock (table de jointure) et on fait un JOIN avec Stock
    // Génère : SELECT SUM(VenteStock.totalPrice) AS ca,
    //                 SUM(VenteStock.quantity) AS quantiteVendue,
    //                 Stock.id, Stock.productName, Stock.price
    //          FROM VenteStocks
    //          JOIN Stocks ON ...
    //          GROUP BY Stock.id, Stock.productName, Stock.price
    //          ORDER BY ca DESC
    // ----------------------------------------------------------
    const caParProduit = await VenteStock.findAll({
      attributes: [
        // On additionne le CA généré par ce produit dans toutes les ventes
        [fn("SUM", col("VenteStock.totalPrice")), "ca"],

        // On additionne toutes les quantités vendues de ce produit
        [fn("SUM", col("VenteStock.quantity")), "quantiteVendue"],
      ],

      // JOIN avec la table Stock pour récupérer le nom et le prix du produit
      include: [
        {
          model: Stock,
          attributes: ["id", "productName", "price"], // Colonnes à récupérer depuis Stock
        },
      ],

      // GROUP BY : on regroupe par produit (une ligne par produit)
      group: ["Stock.id", "Stock.productName", "Stock.price"],

      // ORDER BY ca DESC : produit le plus rentable en premier
      order: [[literal("ca"), "DESC"]],

      raw: true,  // Objets JS simples
      nest: true, // Permet d'accéder à r.Stock.id au lieu de r["Stock.id"]
    });

    // On retourne toutes les statistiques dans une seule réponse JSON
    return res.json({
      // parseFloat() pour s'assurer que c'est un nombre décimal et pas une string
      caGlobal: parseFloat(caGlobal),

      // On formate chaque entrée du CA annuel
      caAnnuel: caAnnuel.map((r) => ({
        annee: parseInt(r.annee),   // Conversion en entier
        ca: parseFloat(r.ca),       // Conversion en float
      })),

      caMensuel, // Déjà formaté plus haut

      // On formate chaque produit
      caParProduit: caParProduit.map((r) => ({
        id: r.Stock.id,                             // ID du produit
        productName: r.Stock.productName,           // Nom du produit
        price: r.Stock.price,                       // Prix unitaire
        ca: parseFloat(r.ca),                       // CA total généré
        quantiteVendue: parseInt(r.quantiteVendue), // Quantité totale vendue
      })),

      anneeActuelle, // Utile pour le front-end pour savoir quelle année est affichée
    });

  } catch (error) {
    // On affiche l'erreur dans les logs du serveur (très utile pour débugger)
    console.error("Erreur getCA :", error);

    // On retourne une erreur 500 avec le message d'erreur
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ============================================================
// GET /api/stats/ca/annee/:annee
// CA mensuel pour une année précise passée dans l'URL
// Exemple : GET /api/stats/ca/annee/2023
// ============================================================
exports.getCAByAnnee = async (req, res) => {
  try {
    // parseInt() convertit la string "2023" de l'URL en nombre entier 2023
    const annee = parseInt(req.params.annee);

    // isNaN() → "is Not a Number" → si la conversion a échoué, on retourne une erreur
    if (isNaN(annee)) return res.status(400).json({ message: "Année invalide" });

    // Même logique que caMensuelRaw dans getCA, mais pour l'année demandée
    const raw = await Vente.findAll({
      attributes: [
        [fn("MONTH", col("date")), "mois"],
        [fn("SUM", col("totalPrice")), "ca"],
      ],
      where: {
        date: {
          [Op.between]: [
            new Date(`${annee}-01-01T00:00:00`),
            new Date(`${annee}-12-31T23:59:59`),
          ],
        },
      },
      group: [fn("MONTH", col("date"))],
      order: [[literal("mois"), "ASC"]],
      raw: true,
    });

    // Construction du tableau 12 mois (même logique que plus haut)
    const caMensuel = Array.from({ length: 12 }, (_, i) => {
      const found = raw.find((r) => parseInt(r.mois) === i + 1);
      return { mois: i + 1, ca: found ? parseFloat(found.ca) : 0 };
    });

    // Calcul du CA total annuel : on additionne tous les mois avec reduce()
    // reduce((accumulateur, moisActuel) => accumulateur + ca, valeurInitiale=0)
    const caTotal = caMensuel.reduce((s, m) => s + m.ca, 0);

    return res.json({ annee, caTotal, caMensuel });

  } catch (error) {
    console.error("Erreur getCAByAnnee :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
