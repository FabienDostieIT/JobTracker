const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true 
  },
  logoUrl: { 
    type: String,
    required: true 
  },
  dateAjout: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Source', sourceSchema); 