const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  entreprise: {
    type: String,
    required: true,
    trim: true
  },
  poste: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  datePostulation: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    required: true,
    enum: ['postulé', 'relance', 'entretien', 'accepté', 'refusé']
  },
  documents: [{
    type: String,
    trim: true
  }],
  emailEmployeur: {
    type: String,
    trim: true,
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Please enter a valid email']
  },
  telephoneContact: {
    type: String,
    trim: true
  },
  commentaires: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  dateEntretien: {
    type: Date
  },
  calendarEventId: {
    type: String,
    trim: true
  },
  calendarEventUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', ContactSchema); 