const ExcelJS = require('exceljs');
const asyncWrapper = require('../middleware/asyncWrapper');
const service = require('../services/adminProductService');
const Voucher = require('../models/Voucher');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

exports.listProducts = asyncWrapper(async (req, res) => {
  const result = await service.listProducts(req.query);
  res.json({ success: true, ...result });
});

exports.getProduct = asyncWrapper(async (req, res) => {
  const product = await service.getProduct(req.params.code);
  if (!product) return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
  res.json({ success: true, data: product });
});

exports.createProduct = asyncWrapper(async (req, res) => {
  const product = await service.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncWrapper(async (req, res) => {
  const product = await service.updateProduct(req.params.code, req.body);
  if (!product) return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
  res.json({ success: true, data: product });
});

exports.deleteProduct = asyncWrapper(async (req, res) => {
  const product = await service.deleteProduct(req.params.code);
  if (!product) return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

exports.uploadImages = asyncWrapper(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'Không có file nào được tải lên' });
  }
  const urls = await Promise.all(
    req.files.map(f => uploadToCloudinary(f.buffer, f.mimetype))
  );
  res.json({ success: true, data: urls.map(r => r.secure_url) });
});

exports.exportProducts = asyncWrapper(async (req, res) => {
  const products = await service.exportProducts(req.query);

  const workbook = new ExcelJS.Workbook();
  const sheet    = workbook.addWorksheet('Products');

  sheet.columns = [
    { header: 'productCode',   key: 'productCode',   width: 22 },
    { header: 'name',          key: 'name',           width: 55 },
    { header: 'price',         key: 'price',          width: 16 },
    { header: 'discountPrice', key: 'discountPrice',  width: 16 },
    { header: 'brand',         key: 'brand',          width: 18 },
    { header: 'category',      key: 'category',       width: 28 },
    { header: 'subcategory',   key: 'subcategory',    width: 28 },
    { header: 'quantity',      key: 'quantity',       width: 10 },
    { header: 'description',   key: 'description',    width: 70 },
    { header: 'images',        key: 'images',         width: 90 },
    { header: 'sale',          key: 'sale',           width: 10 },
    { header: 'highlighted',   key: 'highlighted',    width: 13 },
    { header: 'isDisplay',     key: 'isDisplay',      width: 13 },
  ];

  const hRow = sheet.getRow(1);
  hRow.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
  hRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  hRow.alignment = { horizontal: 'center', vertical: 'middle' };
  hRow.height    = 22;

  for (const p of products) {
    sheet.addRow({
      productCode:   p.productCode,
      name:          p.name,
      price:         p.price,
      discountPrice: p.discountPrice || 0,
      brand:         p.brand || '',
      category:      p.category || '',
      subcategory:   p.subcategory || '',
      quantity:      p.quantity || 0,
      description:   p.description || '',
      images:        Array.isArray(p.images) ? p.images.join(',') : (p.images || ''),
      sale:          p.sale        ? 'TRUE' : 'FALSE',
      highlighted:   p.highlighted ? 'TRUE' : 'FALSE',
      isDisplay:     p.isDisplay !== false ? 'TRUE' : 'FALSE',
    });
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const date     = new Date().toISOString().slice(0, 10);
  const filename = `vgp_products_${date}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
});

exports.importProducts = asyncWrapper(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Vui lòng tải lên file Excel' });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.worksheets[0];

  // First row = headers, normalise to camelCase keys
  const headerRow = sheet.getRow(1);
  const headerMap = {
    'productcode': 'productCode', 'mã sp': 'productCode', 'ma sp': 'productCode',
    'name': 'name', 'tên sp': 'name', 'ten sp': 'name',
    'price': 'price', 'giá': 'price', 'gia': 'price',
    'discountprice': 'discountPrice', 'giá sale': 'discountPrice', 'gia sale': 'discountPrice',
    'brand': 'brand', 'thương hiệu': 'brand', 'thuong hieu': 'brand',
    'category': 'category', 'danh mục': 'category', 'danh muc': 'category',
    'subcategory': 'subcategory', 'danh mục con': 'subcategory', 'danh muc con': 'subcategory',
    'quantity': 'quantity', 'số lượng': 'quantity', 'so luong': 'quantity',
    'description': 'description', 'mô tả': 'description', 'mo ta': 'description',
    'images': 'images', 'hình ảnh': 'images', 'hinh anh': 'images',
    'sale': 'sale',
    'highlighted': 'highlighted', 'nổi bật': 'highlighted', 'noi bat': 'highlighted',
    'isdisplay': 'isDisplay', 'hiển thị': 'isDisplay', 'hien thi': 'isDisplay',
  };

  const headers = [];
  headerRow.eachCell((cell, col) => {
    const raw = String(cell.value || '').trim().toLowerCase();
    headers[col - 1] = headerMap[raw] || raw;
  });

  const rows = [];
  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const key = headers[col - 1];
      if (key) obj[key] = cell.value;
    });
    if (Object.keys(obj).some(k => obj[k] != null && obj[k] !== '')) {
      rows.push(obj);
    }
  });

  const result = await service.importProducts(rows);
  res.json({ success: true, data: result });
});

// Sync which vouchers a product belongs to
exports.syncProductVouchers = asyncWrapper(async (req, res) => {
  const { code } = req.params;
  const { voucherIds = [] } = req.body;

  // Remove product from all vouchers that had it
  await Voucher.updateMany({ products: code }, { $pull: { products: code } });

  // Add product to the selected vouchers
  if (voucherIds.length > 0) {
    await Voucher.updateMany(
      { _id: { $in: voucherIds } },
      { $addToSet: { products: code } }
    );
  }

  res.json({ success: true, message: 'Đã cập nhật voucher cho sản phẩm' });
});

// Get vouchers that include a specific product
exports.getProductVouchers = asyncWrapper(async (req, res) => {
  const vouchers = await Voucher.find({ products: req.params.code }).lean();
  res.json({ success: true, data: vouchers });
});
