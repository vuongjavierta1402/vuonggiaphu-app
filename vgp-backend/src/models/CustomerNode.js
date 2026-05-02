const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, default: '' },
  email:       { type: String, default: '' },
  address:     { type: String, default: '' },
  description: { type: String, default: '' },
  notes:       { type: String, default: '' },
  tags:        [{ type: String }],
  groupIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerGroup' }],
  position:    {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
  },
}, { timestamps: true });

module.exports = mongoose.model('CustomerNode', schema);
