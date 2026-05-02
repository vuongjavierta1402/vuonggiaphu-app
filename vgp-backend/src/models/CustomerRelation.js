const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  from:  { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNode', required: true },
  to:    { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerNode', required: true },
  label: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CustomerRelation', schema);
