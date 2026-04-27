const productService = require('../services/productService');

exports.getProducts = async (req, res) => {
  const {
    page = '1',
    limit = '24',
    category,
    subcategory,
    brand,
    sale,
    highlighted,
    minPrice,
    maxPrice,
    sort,
    q,
  } = req.query;

  const result = await productService.findProducts({
    page:        Math.max(1, parseInt(page, 10)),
    limit:       Math.min(100, Math.max(1, parseInt(limit, 10))),
    category,
    subcategory,
    brand,
    sale:        sale === 'true' ? true : sale === 'false' ? false : undefined,
    highlighted: highlighted === 'true' ? true : highlighted === 'false' ? false : undefined,
    minPrice:    minPrice !== undefined ? parseInt(minPrice, 10) : undefined,
    maxPrice:    maxPrice !== undefined ? parseInt(maxPrice, 10) : undefined,
    sort,
    q,
  });

  res.json({ success: true, data: result });
};

exports.getProductByCode = async (req, res) => {
  const product = await productService.findByProductCode(req.params.productCode);
  if (!product) {
    const err = new Error('Không tìm thấy sản phẩm');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: product });
};

exports.getFeatured = async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '6', 10));
  const products = await productService.findFeatured(limit);
  res.json({ success: true, data: { products } });
};

exports.getSaleProducts = async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit || '24', 10));
  const page  = Math.max(1, parseInt(req.query.page || '1', 10));
  const result = await productService.findSale(limit, page);
  res.json({ success: true, data: result });
};

exports.getSimilar = async (req, res) => {
  const { productCode } = req.params;
  const limit = Math.min(20, parseInt(req.query.limit || '6', 10));

  const product = await productService.findByProductCode(productCode);
  if (!product) {
    const err = new Error('Không tìm thấy sản phẩm');
    err.statusCode = 404;
    throw err;
  }

  const products = await productService.findSimilar(productCode, product.subcategory, limit);
  res.json({ success: true, data: { products } });
};
