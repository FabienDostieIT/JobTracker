const express = require('express');
const router = express.Router();
const Source = require('../models/Source');

// Obtenir toutes les sources
router.get('/', async (req, res) => {
  try {
    const sources = await Source.find().sort({ frequenceUtilisation: -1 });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter une nouvelle source
router.post('/', async (req, res) => {
  const source = new Source({
    nom: req.body.nom,
    logoUrl: req.body.logoUrl
  });

  try {
    const nouvelleSource = await source.save();
    res.status(201).json(nouvelleSource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Incrémenter la fréquence d'utilisation
router.put('/:id/increment', async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    source.frequenceUtilisation += 1;
    await source.save();
    res.json(source);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ajouter cette route
router.delete('/:id', async (req, res) => {
  try {
    const source = await Source.findByIdAndDelete(req.params.id);
    if (!source) {
      return res.status(404).json({ message: "Source non trouvée" });
    }
    res.json({ message: "Source supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 