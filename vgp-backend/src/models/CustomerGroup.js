const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  color:       { type: String, default: '#3b82f6' },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CustomerGroup', schema);
