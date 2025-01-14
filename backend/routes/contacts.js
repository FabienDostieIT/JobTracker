const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendTestEmail } = require('../services/notificationService');

// Récupérer tous les contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ dateCreation: -1 });
    console.log('Contacts récupérés:', contacts.length);
    res.json(contacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Créer un nouveau contact
router.post('/', async (req, res) => {
  console.log('Tentative de création de contact avec les données:', req.body);
  const contact = new Contact(req.body);
  try {
    const nouveauContact = await contact.save();
    console.log('Nouveau contact créé:', nouveauContact);
    res.status(201).json(nouveauContact);
  } catch (error) {
    console.error('Erreur lors de la création du contact:', error);
    res.status(400).json({ message: error.message });
  }
});

// Modifier un contact
router.put('/:id', async (req, res) => {
  console.log('Tentative de modification du contact:', req.params.id);
  console.log('Données de modification:', req.body);
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    console.log('Contact modifié:', contact);
    res.json(contact);
  } catch (error) {
    console.error('Erreur lors de la modification du contact:', error);
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un contact
router.delete('/:id', async (req, res) => {
  console.log('Tentative de suppression du contact:', req.params.id);
  try {
    await Contact.findByIdAndDelete(req.params.id);
    console.log('Contact supprimé avec succès');
    res.json({ message: 'Candidature supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression du contact:', error);
    res.status(500).json({ message: error.message });
  }
});

// Ajoutez cette route
router.post('/test-email', async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ message: 'Email de test envoyé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 