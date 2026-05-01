import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orderApi';
import { formatVND } from '../utils/currency';
import Loader from '../components/UI/Loader';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Chờ xác nhận' },
  { key: 'confirmed',  label: 'Đã xác nhận'  },
  { key: 'processing', label: 'Đang xử lý'   },
  { key: 'shipped',    label: 'Đang giao'     },
  { key: 'delivered',  label: 'Đã giao'       },
];

const statusIndex = (status) =>
  STATUS_STEPS.findIndex((s) => s.key === status);

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn:  () => fetchOrder(orderNumber),
    select:   (res) => res.data,
    enabled:  !!orderNumber,
    retry:    1,
    staleTime: 60 * 1000,
  });

  if (isLoading) return <Loader text="Đang tải đơn hàng..." />;

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: 64 }}>📭</div>
        <h2 className="font-weight-bold mt-3">Không tìm thấy đơn hàng</h2>
        <p className="text-muted">Mã đơn hàng <strong>{orderNumber}</strong> không tồn tại.</p>
        <Link to="/" className="btn btn-danger mt-3">Về trang chủ</Link>
      </div>
    );
  }

  const activeStep  = statusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h4 font-weight-bold mb-1">Đơn Hàng #{order.orderNumber}</h1>
          <small className="text-muted">
            Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
          </small>
        </div>
        <span className={`badge px-3 py-2 ${isCancelled ? 'badge-secondary' : 'badge-success'}`} style={{ fontSize: '0.85rem' }}>
          {isCancelled ? 'Đã huỷ' : STATUS_STEPS[activeStep]?.label || order.status}
        </span>
      </div>

      {/* Progress bar */}
      {!isCancelled && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <div className="d-flex justify-content-between position-relative">
            {/* connector line */}
            <div
              className="position-absolute"
              style={{
                top: 16, left: '10%', right: '10%', height: 3,
                background: '#dee2e6', zIndex: 0,
              }}
            />
            <div
              className="position-absolute"
              style={{
                top: 16, left: '10%',
                width: `${Math.min(100, (activeStep / (STATUS_STEPS.length - 1)) * 80)}%`,
                height: 3,
                background: 'var(--color-primary)', zIndex: 1,
                transition: 'width 0.4s ease',
              }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} className="text-center" style={{ zIndex: 2, minWidth: 60 }}>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{
                    width: 32, height: 32,
                    background: i <= activeStep ? 'var(--color-primary)' : '#dee2e6',
                    color: i <= activeStep ? '#fff' : '#6c757d',
                    fontSize: 14, fontWeight: 'bold',
                  }}
                >
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <small className="d-block text-center" style={{ fontSize: '0.7rem', maxWidth: 64, lineHeight: 1.3 }}>
                  {step.label}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer info */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="font-weight-bold mb-3">Thông Tin Giao Hàng</h6>
          <div className="row small">
            <div className="col-6">
              <div className="text-muted">Họ tên</div>
              <div>{order.customer?.firstName} {order.customer?.secondName}</div>
            </div>
            <div className="col-6">
              <div className="text-muted">Điện thoại</div>
              <div>{order.customer?.phone || '—'}</div>
            </div>
            <div className="col-12 mt-2">
              <div className="text-muted">Địa chỉ</div>
              <div>{order.customer?.address || '—'}</div>
            </div>
            <div className="col-6 mt-2">
              <div className="text-muted">Phương thức giao hàng</div>
              <div>{order.deliveryOption?.name || '—'}</div>
            </div>
            <div className="col-6 mt-2">
              <div className="text-muted">Thanh toán</div>
              <div>
                {order.paymentMethod === 'onDelivery'   && 'Thanh toán khi nhận hàng'}
                {order.paymentMethod === 'bankTransfer' && 'Chuyển khoản ngân hàng'}
                {order.paymentMethod === 'creditCard'   && 'Thẻ tín dụng'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="font-weight-bold mb-3">Sản Phẩm Đã Đặt</h6>
          {(order.items || []).map((item) => (
            <div key={item.productCode} className="d-flex align-items-center gap-3 mb-3">
              <img
                src={item.image ? `/images/${item.image}` : '/images/placeholder.jpg'}
                alt={item.name}
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
              <div className="flex-grow-1">
                <Link to={`/${item.productCode}`} className="text-dark text-decoration-none small font-weight-bold">
                  {item.name}
                </Link>
                <div className="small text-muted">× {item.quantity}</div>
              </div>
              <span className="small text-danger font-weight-bold text-nowrap">
                {formatVND((item.discountPrice || item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body small">
          <div className="d-flex justify-content-between mb-1">
            <span>Tạm tính</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span>Phí giao hàng</span>
            <span>{formatVND(order.shippingCost)}</span>
          </div>
          {order.promoDiscount > 0 && (
            <div className="d-flex justify-content-between mb-1 text-success">
              <span>Giảm giá ({order.promoCode})</span>
              <span>-{order.promoDiscount}%</span>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between font-weight-bold">
            <span>Tổng cộng</span>
            <span className="text-danger">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/" className="btn btn-outline-secondary mr-2">Về trang chủ</Link>
        <Link to="/all" className="btn btn-danger">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
