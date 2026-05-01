import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOrderSuccess } from '../store/slices/cartSlice';
import { applyPromo, removePromo } from '../store/slices/promoSlice';
import { submitOrder, validatePromo } from '../api/orderApi';
import { formatVND } from '../utils/currency';
import { validateCheckoutForm } from '../utils/formValidation';
import { DELIVERY_OPTIONS } from '../utils/constants';
import Alert from '../components/UI/Alert';

const CheckoutPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const cartItems   = useSelector((s) => s.cart.items);
  const usedPromo   = useSelector((s) => s.promo.usedPromoCode);

  const [form, setForm] = useState({
    firstName: '', secondName: '', email: '', phone: '', address: '',
  });
  const [delivery, setDelivery]       = useState(DELIVERY_OPTIONS[0]);
  const [payment, setPayment]         = useState('onDelivery');
  const [promoInput, setPromoInput]   = useState('');
  const [promoError, setPromoError]   = useState('');
  const [formErrors, setFormErrors]   = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');

  const subtotal = cartItems.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0);

  const qualifyingSubtotal = (() => {
    if (!usedPromo) return 0;
    if (usedPromo.applyTo === 'products') {
      const eligible = new Set(usedPromo.products || []);
      return cartItems.reduce((s, i) => s + (eligible.has(i.productCode) ? (i.discountPrice || i.price) * i.quantity : 0), 0);
    }
    return subtotal; // 'all' and 'categories' apply to full subtotal
  })();

  const discount = usedPromo
    ? (usedPromo.discountType === 'fixed'
        ? Math.min(usedPromo.discountValue, qualifyingSubtotal)
        : Math.round(qualifyingSubtotal * (usedPromo.discountValue / 100)))
    : 0;
  const total = subtotal + delivery.cost - discount;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePromo = async () => {
    setPromoError('');
    try {
      const res = await validatePromo(promoInput);
      dispatch(applyPromo(res.data));
      setPromoInput('');
    } catch (err) {
      setPromoError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCheckoutForm(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitOrder({
        customer:      form,
        items:         cartItems.map((i) => ({ productCode: i.productCode, quantity: i.quantity })),
        deliveryOption: delivery,
        paymentMethod: payment,
        promoCode:        usedPromo?.code,
        promoDiscountType: usedPromo?.discountType,
        promoDiscount:     discount,
        currency:      'VND',
      });
      dispatch(setOrderSuccess({ success: true, orderNumber: result?.data?.orderNumber }));
      navigate('/cart');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>Giỏ hàng trống</h2>
        <Link to="/all" className="btn btn-danger mt-3">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h3 font-weight-bold mb-4">Thanh Toán</h1>

      <Alert type="danger" message={submitError} onClose={() => setSubmitError('')} />

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Left: Customer form */}
          <div className="col-md-7">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="font-weight-bold mb-3">Thông Tin Giao Hàng</h5>

                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Họ *</label>
                    <input className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`} value={form.firstName} onChange={update('firstName')} />
                    {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
                  </div>
                  <div className="form-group col-md-6">
                    <label>Tên *</label>
                    <input className={`form-control ${formErrors.secondName ? 'is-invalid' : ''}`} value={form.secondName} onChange={update('secondName')} />
                    {formErrors.secondName && <div className="invalid-feedback">{formErrors.secondName}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`} value={form.email} onChange={update('email')} />
                  {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`} value={form.phone} onChange={update('phone')} />
                  {formErrors.phone && <div className="invalid-feedback">{formErrors.phone}</div>}
                </div>

                <div className="form-group">
                  <label>Địa chỉ giao hàng *</label>
                  <textarea className={`form-control ${formErrors.address ? 'is-invalid' : ''}`} rows={3} value={form.address} onChange={update('address')} />
                  {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="font-weight-bold mb-3">Phương Thức Giao Hàng</h5>
                {DELIVERY_OPTIONS.map((opt) => (
                  <div key={opt.id} className="form-check mb-2">
                    <input
                      type="radio"
                      className="form-check-input"
                      id={`delivery-${opt.id}`}
                      checked={delivery.id === opt.id}
                      onChange={() => setDelivery(opt)}
                    />
                    <label className="form-check-label" htmlFor={`delivery-${opt.id}`}>
                      <strong>{opt.name}</strong>{' '}
                      <small className="text-muted">({opt.duration}) — {formatVND(opt.cost)}</small>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="font-weight-bold mb-3">Phương Thức Thanh Toán</h5>
                {[
                  { value: 'onDelivery',   label: '💵 Thanh toán khi nhận hàng' },
                  { value: 'bankTransfer', label: '🏦 Chuyển khoản ngân hàng' },
                ].map((opt) => (
                  <div key={opt.value} className="form-check mb-2">
                    <input
                      type="radio"
                      className="form-check-input"
                      id={`pay-${opt.value}`}
                      checked={payment === opt.value}
                      onChange={() => setPayment(opt.value)}
                    />
                    <label className="form-check-label" htmlFor={`pay-${opt.value}`}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="font-weight-bold mb-3">Đơn Hàng ({cartItems.length} sản phẩm)</h5>

                {cartItems.map((item) => (
                  <div key={item.productCode} className="d-flex justify-content-between mb-2 small">
                    <span className="text-truncate mr-2" style={{ maxWidth: 160 }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-nowrap">{formatVND((item.discountPrice || item.price) * item.quantity)}</span>
                  </div>
                ))}

                <hr />

                {/* Promo code */}
                <div className="mb-3">
                  <label className="small font-weight-bold">Mã khuyến mãi</label>
                  {usedPromo ? (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge badge-success">
                        {usedPromo.code} ({usedPromo.discountType === 'fixed' ? `-${formatVND(usedPromo.discountValue)}` : `-${usedPromo.discountValue}%`})
                      </span>
                      <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => dispatch(removePromo())}>
                        Xóa
                      </button>
                    </div>
                  ) : (
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className={`form-control ${promoError ? 'is-invalid' : ''}`}
                        placeholder="Nhập mã..."
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      />
                      <div className="input-group-append">
                        <button type="button" className="btn btn-outline-danger" onClick={handlePromo}>
                          Áp dụng
                        </button>
                      </div>
                      {promoError && <div className="invalid-feedback d-block">{promoError}</div>}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between mb-1">
                  <span>Tạm tính</span><span>{formatVND(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Phí giao hàng</span><span>{formatVND(delivery.cost)}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>Giảm giá</span><span>-{formatVND(discount)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between font-weight-bold">
                  <span>Tổng cộng</span>
                  <span className="text-danger h5 mb-0">{formatVND(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger btn-block btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Đang xử lý...' : '✅ Đặt Hàng Ngay'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
