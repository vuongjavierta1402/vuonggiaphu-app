const Order     = require('../models/Order');
const Product   = require('../models/Product');
const PromoCode = require('../models/PromoCode');

exports.createOrder = async (req, res) => {
  const { customer, items, deliveryOption, paymentMethod, promoCode, promoDiscount, currency } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('Thiếu thông tin đơn hàng');
    err.statusCode = 400;
    throw err;
  }

  // Snapshot prices from the database at order time
  const codes = items.map((i) => i.productCode);
  const products = await Product.find({ productCode: { $in: codes } }).select('productCode name price discountPrice images').lean();
  const productMap = Object.fromEntries(products.map((p) => [p.productCode, p]));

  const orderItems = items.map((item) => {
    const p = productMap[item.productCode];
    if (!p) {
      const err = new Error(`Sản phẩm không tồn tại: ${item.productCode}`);
      err.statusCode = 400;
      throw err;
    }
    return {
      productCode:   p.productCode,
      name:          p.name,
      price:         p.price,
      discountPrice: p.discountPrice,
      image:         p.images?.[0] || '',
      quantity:      item.quantity,
    };
  });

  const subtotal     = orderItems.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.quantity, 0);
  const shippingCost = deliveryOption?.cost || 0;
  const discount     = promoDiscount ? Math.round(subtotal * (promoDiscount / 100)) : 0;
  const total        = subtotal + shippingCost - discount;

  const order = await Order.create({
    customer,
    items: orderItems,
    deliveryOption,
    paymentMethod: paymentMethod || 'onDelivery',
    promoCode,
    promoDiscount: promoDiscount || 0,
    subtotal,
    shippingCost,
    total,
    currency: currency || 'VND',
  });

  // Track promo usage so usageLimit is enforced correctly
  if (promoCode) {
    await PromoCode.findOneAndUpdate(
      { code: promoCode.toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
  }

  res.status(201).json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      total:       order.total,
      status:      order.status,
    },
  });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
  if (!order) {
    const err = new Error('Không tìm thấy đơn hàng');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: order });
};
