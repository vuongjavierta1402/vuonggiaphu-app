const asyncWrapper = require('../middleware/asyncWrapper');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  {
    name: 'Thiết Bị Vệ Sinh', slug: 'thiet-bi-ve-sinh', icon: '🚿', order: 1,
    subcategories: [
      { name: 'Bồn cầu', slug: 'bon-cau' },
      { name: 'Bồn cầu điện tử', slug: 'bon-cau-dien-tu' },
      { name: 'Chậu Lavabo', slug: 'chau-lavabo' },
      { name: 'Vòi chậu', slug: 'voi-chau' },
      { name: 'Vòi sen', slug: 'voi-sen' },
      { name: 'Sen cây', slug: 'sen-cay' },
      { name: 'Bồn tắm', slug: 'bon-tam' },
      { name: 'Bồn tiểu', slug: 'bon-tieu' },
      { name: 'Phụ kiện', slug: 'phu-kien' },
    ],
  },
  {
    name: 'Thiết Bị Nhà Bếp', slug: 'thiet-bi-nha-bep', icon: '🍳', order: 2,
    subcategories: [
      { name: 'Bếp Điện Từ', slug: 'bep-dien-tu' },
      { name: 'Bếp Gas', slug: 'bep-gas' },
      { name: 'Máy Hút Mùi', slug: 'may-hut-mui' },
      { name: 'Chậu rửa chén', slug: 'chau-rua-chen' },
      { name: 'Vòi rửa chén', slug: 'voi-rua-chen' },
    ],
  },
  {
    name: 'Thiết Bị Nước', slug: 'thiet-bi-nuoc', icon: '💧', order: 3,
    subcategories: [],
  },
];

exports.getCategories = asyncWrapper(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  res.json({ success: true, data: categories });
});

exports.createCategory = asyncWrapper(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncWrapper(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).lean();
  if (!category) return res.status(404).json({ success: false, error: 'Không tìm thấy danh mục' });
  res.json({ success: true, data: category });
});

exports.deleteCategory = asyncWrapper(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, error: 'Không tìm thấy danh mục' });
  res.json({ success: true, message: 'Đã xóa danh mục' });
});

exports.seedDefaults = asyncWrapper(async (req, res) => {
  const count = await Category.countDocuments();
  if (count > 0) {
    return res.status(409).json({ success: false, error: 'Dữ liệu danh mục đã tồn tại. Xóa tất cả trước khi seed lại.' });
  }
  await Category.insertMany(DEFAULT_CATEGORIES);
  res.json({ success: true, message: `Đã seed ${DEFAULT_CATEGORIES.length} danh mục` });
});
