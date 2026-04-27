const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productCode:   { type: String, required: true },
    name:          String,
    price:         Number,
    discountPrice: Number,
    image:         String,
    quantity:      { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      firstName:  { type: String, required: true },
      secondName: { type: String, required: true },
      email:      { type: String, required: true },
      phone:      String,
      address:    String,
    },
    items: [OrderItemSchema],
    deliveryOption: {
      id:       Number,
      name:     String,
      cost:     Number,
      duration: String,
    },
    paymentMethod: {
      type: String,
      enum: ['creditCard', 'onDelivery', 'bankTransfer'],
      default: 'onDelivery',
    },
    promoCode:     String,
    promoDiscount: { type: Number, default: 0 },
    subtotal:      { type: Number, required: true },
    shippingCost:  { type: Number, default: 0 },
    total:         { type: Number, required: true },
    currency:      { type: String, default: 'VND' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Auto-generate order number before save
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `VGP-${yyyymmdd}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
