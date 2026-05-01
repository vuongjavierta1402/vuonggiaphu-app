const Product = require('../models/Product');

const toSlug = (name, code) => {
  const base = name
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${code.toLowerCase()}`;
};

const toBool = (val, fallback) => {
  if (val === true || val === 1 || String(val).toLowerCase() === 'true') return true;
  if (val === false || val === 0 || String(val).toLowerCase() === 'false') return false;
  return fallback;
};

exports.listProducts = async ({ page = 1, limit = 20, search, category, subcategory, minPrice, maxPrice, sale, isDisplay, voucherId }) => {
  const filter = {};

  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { productCode: { $regex: search, $options: 'i' } },
  ];
  if (category)    filter.category    = category;
  if (subcategory) filter.subcategory = subcategory;
  if (sale !== undefined)      filter.sale      = sale === 'true' || sale === true;
  if (isDisplay !== undefined) filter.isDisplay = isDisplay === 'true' || isDisplay === true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (voucherId) {
    const Voucher = require('../models/Voucher');
    const v = await Voucher.findById(voucherId).lean();
    if (v) {
      if (v.applyTo === 'all') {
        // no extra filter — every product qualifies
      } else if (v.applyTo === 'categories') {
        const catFilter = { category: { $in: v.categories } };
        const explicitFilter = v.products.length ? { productCode: { $in: v.products } } : null;
        filter.$or = explicitFilter ? [catFilter, explicitFilter] : [catFilter];
      } else {
        filter.productCode = { $in: v.products };
      }
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-description -relatedProducts -partProducts -attachments')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) };
};

exports.getProduct = (code) => Product.findOne({ productCode: code }).lean();

exports.createProduct = async (data) => {
  const slug = toSlug(data.name, data.productCode);
  return Product.create({ ...data, slug });
};

exports.updateProduct = async (code, data) => {
  const effectiveCode = data.productCode || code;
  if (data.name || data.productCode) {
    const name = data.name || (await Product.findOne({ productCode: code }).select('name').lean())?.name || '';
    data.slug = toSlug(name, effectiveCode);
  }
  return Product.findOneAndUpdate(
    { productCode: code },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
};

exports.deleteProduct = (code) => Product.findOneAndDelete({ productCode: code });

exports.exportProducts = async ({ search, category, subcategory, minPrice, maxPrice, sale, isDisplay, voucherId } = {}) => {
  const filter = {};

  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { productCode: { $regex: search, $options: 'i' } },
  ];
  if (category)    filter.category    = category;
  if (subcategory) filter.subcategory = subcategory;
  if (sale !== undefined)      filter.sale      = sale === 'true' || sale === true;
  if (isDisplay !== undefined) filter.isDisplay = isDisplay === 'true' || isDisplay === true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (voucherId) {
    const Voucher = require('../models/Voucher');
    const v = await Voucher.findById(voucherId).lean();
    if (v) {
      if (v.applyTo === 'all') {
        // no extra filter
      } else if (v.applyTo === 'categories') {
        const catFilter = { category: { $in: v.categories } };
        const explicitFilter = v.products.length ? { productCode: { $in: v.products } } : null;
        filter.$or = explicitFilter ? [catFilter, explicitFilter] : [catFilter];
      } else {
        filter.productCode = { $in: v.products };
      }
    }
  }

  return Product.find(filter).sort({ createdAt: -1 }).lean();
};

exports.importProducts = async (rows) => {
  let imported = 0;
  let updated = 0;
  const errors = [];

  for (const [i, row] of rows.entries()) {
    try {
      const code = String(row.productCode || '').trim();
      const name = String(row.name || '').trim();
      const price = parseFloat(row.price);

      if (!code) { errors.push({ row: i + 2, error: 'Thiếu productCode' }); continue; }
      if (!name) { errors.push({ row: i + 2, error: 'Thiếu name' }); continue; }
      if (isNaN(price)) { errors.push({ row: i + 2, error: 'price không hợp lệ' }); continue; }

      const images = row.images
        ? String(row.images).split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const doc = {
        name,
        price,
        discountPrice: parseFloat(row.discountPrice) || 0,
        brand:         String(row.brand || '').trim() || null,
        category:      String(row.category || '').trim(),
        subcategory:   String(row.subcategory || '').trim(),
        quantity:      parseInt(row.quantity, 10) || 0,
        description:   String(row.description || '').trim(),
        images,
        sale:        toBool(row.sale, false),
        highlighted: toBool(row.highlighted, false),
        isDisplay:   toBool(row.isDisplay, true),
        slug:        toSlug(name, code),
      };

      const existing = await Product.findOne({ productCode: code });
      if (existing) {
        await Product.updateOne({ productCode: code }, { $set: doc });
        updated++;
      } else {
        await Product.create({ productCode: code, ...doc });
        imported++;
      }
    } catch (err) {
      errors.push({ row: i + 2, error: err.message });
    }
  }

  return { imported, updated, errors };
};   
