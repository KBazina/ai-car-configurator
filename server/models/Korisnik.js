const mongoose = require('mongoose')

const korisnikSchema = new mongoose.Schema({
  ime: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lozinka: { type: String, required: true },
  uloga: { type: String, enum: ['user', 'admin'], default: 'user' },
  favoriti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auto' }],
  konfiguracije: [
    {
      modelId: mongoose.Schema.Types.ObjectId,
      konfiguracija: Object
    }
  ]
})

module.exports = mongoose.model('Korisnik', korisnikSchema, 'korisnici')

