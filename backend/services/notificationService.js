const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Contact = require('../models/Contact');
require('dotenv').config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction de test d'email
const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test - Stage Tracker Notification",
      html: `
        <h2>Test de notification</h2>
        <p>Ceci est un test du système de notification de Stage Tracker.</p>
        <p>Si vous recevez cet email, le système fonctionne correctement !</p>
        <p>Date et heure du test : ${new Date().toLocaleString()}</p>
      `
    });
    console.log('Email de test envoyé avec succès:', info.messageId);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Vérification quotidienne des relances
cron.schedule('0 9 * * *', async () => { // Tous les jours à 9h
  try {
    const today = new Date();
    const deuxSemainesAvant = new Date(today.setDate(today.getDate() - 14));
    
    const contactsARelancer = await Contact.find({
      statut: 'Postulé',
      datePostulation: { $lte: deuxSemainesAvant },
      relanceEnvoyee: false,
      emailEmployeur: { $exists: true, $ne: '' }
    });

    for (const contact of contactsARelancer) {
      // Email pour vous (notification de relance)
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Votre email configuré dans .env
        subject: `Relance - Candidature ${contact.entreprise}`,
        html: `
          <h2>Rappel de relance</h2>
          <p>Bonjour,</p>
          <p>Il est temps de faire un suivi pour votre candidature chez <strong>${contact.entreprise}</strong>.</p>
          <p><strong>Détails :</strong></p>
          <ul>
            <li>Poste : ${contact.poste}</li>
            <li>Date de postulation : ${new Date(contact.datePostulation).toLocaleDateString()}</li>
            <li>Email de l'employeur : ${contact.emailEmployeur}</li>
            <li>Source : ${contact.source}</li>
          </ul>
          <p>Suggestions pour la relance :</p>
          <ol>
            <li>Envoyez un email de suivi à ${contact.emailEmployeur}</li>
            <li>Exprimez votre intérêt continu pour le poste</li>
            <li>Demandez une mise à jour sur le processus de recrutement</li>
          </ol>
          <p>Bonne chance !</p>
        `
      });

      // Marquer comme relancé
      contact.relanceEnvoyee = true;
      await contact.save();
      
      console.log(`Notification de relance envoyée pour ${contact.entreprise}`);
    }
  } catch (error) {
    console.error('Erreur lors des relances:', error);
  }
});

module.exports = {
  sendTestEmail
};