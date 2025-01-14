const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');
const Contact = require('../models/Contact');

// Configurer un rappel pour une entrevue
router.post('/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const settings = req.body;

    const contact = await Contact.findOne({ 'entrevues._id': interviewId });
    if (!contact) {
      return res.status(404).json({ message: 'Entrevue non trouvée' });
    }

    const interview = contact.entrevues.id(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Entrevue non trouvée' });
    }

    await reminderService.scheduleReminder(interview, settings);
    res.json({ message: 'Rappel configuré avec succès' });
  } catch (error) {
    console.error('Erreur lors de la configuration du rappel:', error);
    res.status(500).json({ message: 'Erreur lors de la configuration du rappel' });
  }
});

// Annuler un rappel
router.delete('/:interviewId', (req, res) => {
  try {
    const { interviewId } = req.params;
    reminderService.cancelReminder(interviewId);
    res.json({ message: 'Rappel annulé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rappel:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation du rappel' });
  }
});

module.exports = router; 