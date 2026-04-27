const productService = require('../services/productService');
const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  const fromDb = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  if (fromDb.length > 0) {
    return res.json({ success: true, data: fromDb });
  }
  // Fallback: derive from existing products until Category collection is seeded
  const categories = await productService.getCategories();
  res.json({ success: true, data: categories });
};

exports.getBrands = async (req, res) => {
  const brands = await productService.getBrands();
  res.json({ success: true, data: brands });
};
