import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { formatVND } from '../utils/currency';
import { FaTrash } from 'react-icons/fa';

const MAX_CART = 10;

const CartPage = () => {
  const dispatch  = useDispatch();
  const { items, orderSuccess, orderNumber } = useSelector((s) => s.cart);
  const usedPromo = useSelector((s) => s.promo.usedPromoCode);

  const subtotal = items.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.quantity, 0);
  const discount = usedPromo ? Math.round(subtotal * (usedPromo.percentage / 100)) : 0;
  const total    = subtotal - discount;

  // ── Order success ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: 72 }}>✅</div>
        <h2 className="font-weight-bold mt-3">Đặt hàng thành công!</h2>
        {orderNumber && (
          <p className="lead mt-2">
            Mã đơn hàng: <strong className="text-danger">{orderNumber}</strong>
          </p>
        )}
        <p className="text-muted">Cảm ơn bạn đã mua hàng tại VƯƠNG GIA PHÚ. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          {orderNumber && (
            <Link to={`/order/${orderNumber}`} className="btn btn-outline-danger btn-lg">
              Xem trạng thái đơn hàng
            </Link>
          )}
          <Link to="/" className="btn btn-danger btn-lg">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: 72 }}>🛒</div>
        <h2 className="font-weight-bold mt-3">Giỏ hàng trống</h2>
        <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục.</p>
        <Link to="/all" className="btn btn-danger btn-lg mt-3">Xem Sản Phẩm</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 font-weight-bold mb-0">Giỏ Hàng ({items.length} sản phẩm)</h1>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => dispatch(clearCart())}>
          Xóa tất cả
        </button>
      </div>

      <div className="row">
        {/* Cart items */}
        <div className="col-md-8">
          {items.map((item) => (
            <div key={item.productCode} className="card mb-3 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image ? `/images/${item.image}` : '/images/placeholder.jpg'}
                    alt={item.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                  />
                  <div className="flex-grow-1">
                    <Link to={`/${item.productCode}`} className="font-weight-bold text-dark text-decoration-none">
                      {item.name}
                    </Link>
                    <div className="text-danger mt-1">{formatVND(item.discountPrice || item.price)}</div>
                    {item.discountPrice && item.discountPrice < item.price && (
                      <small className="text-muted text-decoration-line-through">{formatVND(item.price)}</small>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => dispatch(updateQuantity({ productCode: item.productCode, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                    >
                      –
                    </button>
                    <span className="px-2 font-weight-bold">{item.quantity}</span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => dispatch(updateQuantity({ productCode: item.productCode, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= MAX_CART}
                    >
                      +
                    </button>
                  </div>

                  <strong className="text-danger text-nowrap" style={{ minWidth: 110, textAlign: 'right' }}>
                    {formatVND((item.discountPrice || item.price) * item.quantity)}
                  </strong>

                  <button
                    className="btn btn-link text-danger p-1"
                    onClick={() => dispatch(removeFromCart(item.productCode))}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="font-weight-bold mb-3">Tổng Đơn Hàng</h5>

              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span>{formatVND(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Giảm giá ({usedPromo.percentage}%)</span>
                  <span>-{formatVND(discount)}</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between font-weight-bold mb-4">
                <span>Tổng cộng</span>
                <span className="text-danger h5 mb-0">{formatVND(total)}</span>
              </div>

              <Link to="/checkout" className="btn btn-danger btn-block btn-lg">
                Tiến hành thanh toán →
              </Link>
              <Link to="/all" className="btn btn-outline-secondary btn-block mt-2">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
