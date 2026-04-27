const PromoCode = require('../models/PromoCode');
const Voucher   = require('../models/Voucher');

exports.validatePromo = async (req, res) => {
  const code = (req.body.code || '').trim().toUpperCase();

  if (!code) {
    const err = new Error('Vui lòng nhập mã khuyến mãi');
    err.statusCode = 400;
    throw err;
  }

  // 1. Check legacy PromoCode collection
  const promo = await PromoCode.findOne({ code });
  if (promo) {
    if (!promo.active) {
      const err = new Error('Mã khuyến mãi không hợp lệ'); err.statusCode = 404; throw err;
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      const err = new Error('Mã khuyến mãi đã hết hạn'); err.statusCode = 400; throw err;
    }
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      const err = new Error('Mã khuyến mãi đã hết lượt sử dụng'); err.statusCode = 400; throw err;
    }
    return res.json({
      success: true,
      data: { code: promo.code, discountType: 'percentage', discountValue: promo.percentage },
    });
  }

  // 2. Check admin Voucher collection
  const voucher = await Voucher.findOne({ code });
  if (!voucher || !voucher.active) {
    const err = new Error('Mã khuyến mãi không hợp lệ'); err.statusCode = 404; throw err;
  }

  const now = new Date();
  if (voucher.startDate && voucher.startDate > now) {
    const err = new Error('Mã khuyến mãi chưa có hiệu lực'); err.statusCode = 400; throw err;
  }
  if (voucher.endDate && voucher.endDate < now) {
    const err = new Error('Mã khuyến mãi đã hết hạn'); err.statusCode = 400; throw err;
  }
  if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
    const err = new Error('Mã khuyến mãi đã hết lượt sử dụng'); err.statusCode = 400; throw err;
  }

  return res.json({
    success: true,
    data: { code: voucher.code, discountType: voucher.discountType, discountValue: voucher.discountValue },
  });
};
