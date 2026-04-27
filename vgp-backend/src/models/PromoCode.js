const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema(
  {
    code:       { type: String, required: true, unique: true, uppercase: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    active:     { type: Boolean, default: true },
    expiresAt:  { type: Date, default: null },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCode', PromoCodeSchema);
