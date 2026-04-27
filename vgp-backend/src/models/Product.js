const mongoose = require('mongoose');

const RelatedProductSchema = new mongoose.Schema(
  {
    productCode:   { type: String, required: true },
    name:          String,
    price:         Number,
    discountPrice: Number,
    link:          String,
    image:         String,
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema(
  {
    name: String,
    link: String,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    productCode:   { type: String, required: true, unique: true, index: true },
    slug:          { type: String, unique: true, index: true },
    name:          { type: String, required: true },
    price:         { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    description:   { type: String, default: '' },
    brand:         { type: String, index: true, default: null },
    images:        [String],
    category:      { type: String, index: true, default: '' },
    subcategory:   { type: String, index: true, default: '' },
    quantity:      { type: Number, default: 0, min: 0 },
    isDisplay:     { type: Boolean, default: true, index: true },
    sale:          { type: Boolean, default: false, index: true },
    highlighted:   { type: Boolean, default: false, index: true },
    relatedProducts: [RelatedProductSchema],
    partProducts:    [RelatedProductSchema],
    attachments:     [AttachmentSchema],
    ratings: {
      star_ratings: { type: Number, default: 0, min: 0, max: 5 },
      votes:        { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

// Compound indexes optimised for the most common query patterns
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ category: 1, isDisplay: 1 });
ProductSchema.index({ brand: 1, isDisplay: 1 });
ProductSchema.index({ sale: 1, isDisplay: 1 });
ProductSchema.index({ highlighted: 1, isDisplay: 1 });
ProductSchema.index({ price: 1 });
// Full-text search on name and brand (works on Atlas M0 free tier)
ProductSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
