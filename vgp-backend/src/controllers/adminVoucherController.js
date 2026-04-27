const asyncWrapper = require('../middleware/asyncWrapper');
const Voucher = require('../models/Voucher');

exports.getVouchers = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, search, active } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { code: { $regex: search, $options: 'i' } },
    { name: { $regex: search, $options: 'i' } },
  ];
  if (active !== undefined) filter.active = active === 'true';

  const [vouchers, total] = await Promise.all([
    Voucher.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Voucher.countDocuments(filter),
  ]);

  res.json({ success: true, data: vouchers, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.getVoucher = asyncWrapper(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id).lean();
  if (!voucher) return res.status(404).json({ success: false, error: 'Không tìm thấy voucher' });
  res.json({ success: true, data: voucher });
});

exports.createVoucher = asyncWrapper(async (req, res) => {
  const voucher = await Voucher.create(req.body);
  res.status(201).json({ success: true, data: voucher });
});

exports.updateVoucher = asyncWrapper(async (req, res) => {
  const voucher = await Voucher.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).lean();
  if (!voucher) return res.status(404).json({ success: false, error: 'Không tìm thấy voucher' });
  res.json({ success: true, data: voucher });
});

exports.deleteVoucher = asyncWrapper(async (req, res) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) return res.status(404).json({ success: false, error: 'Không tìm thấy voucher' });
  res.json({ success: true, message: 'Đã xóa voucher' });
});
