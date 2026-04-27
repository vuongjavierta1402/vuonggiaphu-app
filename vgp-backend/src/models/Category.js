const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const CategorySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, unique: true },
    slug:          { type: String, required: true, unique: true },
    icon:          { type: String, default: '' },
    order:         { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
    subcategories: [SubcategorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
