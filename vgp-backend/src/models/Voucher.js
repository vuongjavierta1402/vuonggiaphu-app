const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    name:          { type: String, required: true },
    description:   { type: String, default: '' },
    discountType:  { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    active:        { type: Boolean, default: true },
    startDate:     { type: Date, default: null },
    endDate:       { type: Date, default: null },
    usageLimit:    { type: Number, default: null },
    usageCount:    { type: Number, default: 0 },
    applyTo:       { type: String, enum: ['all', 'categories', 'products'], default: 'all' },
    categories:    [{ type: String }],
    products:      [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Voucher', VoucherSchema);
