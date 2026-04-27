const Product = require('../models/Product');

// Fields excluded from list views to reduce payload size
const LIST_PROJECTION = '-description -relatedProducts -partProducts -attachments';

/**
 * Build a Mongoose filter object from query parameters.
 */
const buildFilter = ({ category, subcategory, brand, sale, highlighted, minPrice, maxPrice, q }) => {
  const filter = { isDisplay: true };

  if (category)    filter.category    = category;
  if (subcategory) filter.subcategory = subcategory;
  if (brand)       filter.brand       = brand;
  if (sale !== undefined)        filter.sale        = sale;
  if (highlighted !== undefined) filter.highlighted = highlighted;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  return filter;
};

const SORT_MAP = {
  price_asc:  { price: 1 },
  price_desc: { price: -1 },
  rating:     { 'ratings.star_ratings': -1 },
  newest:     { createdAt: -1 },
};

/**
 * Paginated product list with optional filters.
 */
exports.findProducts = async ({
  page = 1,
  limit = 24,
  category,
  subcategory,
  brand,
  sale,
  highlighted,
  minPrice,
  maxPrice,
  sort,
  q,
}) => {
  const filter  = buildFilter({ category, subcategory, brand, sale, highlighted, minPrice, maxPrice, q });
  const sortObj = SORT_MAP[sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(LIST_PROJECTION)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  };
};

/**
 * Single product by productCode (full detail including description, related products).
 */
exports.findByProductCode = (productCode) =>
  Product.findOne({ productCode, isDisplay: true }).lean();

/**
 * Featured products (highlighted flag).
 */
exports.findFeatured = (limit = 6) =>
  Product.find({ highlighted: true, isDisplay: true })
    .select(LIST_PROJECTION)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

/**
 * Sale products.
 */
exports.findSale = (limit = 24, page = 1) => {
  const filter = { sale: true, isDisplay: true };
  return Promise.all([
    Product.find(filter)
      .select(LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]).then(([products, total]) => ({
    products,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  }));
};

/**
 * Similar products: same subcategory, excluding the current product.
 */
exports.findSimilar = (productCode, subcategory, limit = 6) =>
  Product.find({ subcategory, isDisplay: true, productCode: { $ne: productCode } })
    .select(LIST_PROJECTION)
    .limit(limit)
    .lean();

/**
 * All distinct brands with product counts.
 */
exports.getBrands = () =>
  Product.aggregate([
    { $match: { isDisplay: true, brand: { $ne: null } } },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, brand: '$_id', count: 1 } },
  ]);

/**
 * Category taxonomy derived from distinct DB values.
 */
exports.getCategories = async () => {
  const docs = await Product.aggregate([
    { $match: { isDisplay: true } },
    {
      $group: {
        _id: { category: '$category', subcategory: '$subcategory' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.category': 1, '_id.subcategory': 1 } },
  ]);

  // Group subcategories under their parent category
  const map = {};
  for (const { _id, count } of docs) {
    const { category, subcategory } = _id;
    if (!map[category]) {
      map[category] = { name: category, subcategories: [] };
    }
    if (subcategory) {
      map[category].subcategories.push({ name: subcategory, count });
    }
  }

  return Object.values(map);
};
