import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { showModal } from '../store/slices/uiSlice';
import { formatVND } from '../utils/currency';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

const MAX_CART = 10;

const WishlistPage = () => {
  const dispatch   = useDispatch();
  const wishlist   = useSelector((s) => s.wishlist.items);
  const cartItems  = useSelector((s) => s.cart.items);

  const handleAddToCart = (item) => {
    const cartItem = cartItems.find((c) => c.productCode === item.productCode);
    if ((cartItem?.quantity || 0) >= MAX_CART) {
      dispatch(showModal(`Bạn đã thêm tối đa ${MAX_CART} sản phẩm "${item.name}" vào giỏ hàng.`));
      return;
    }
    dispatch(addToCart({
      productCode:   item.productCode,
      name:          item.name,
      price:         item.price,
      discountPrice: item.discountPrice,
      image:         item.image,
      quantity:      1,
    }));
  };

  if (wishlist.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div style={{ fontSize: 72 }}>❤️</div>
        <h2 className="font-weight-bold mt-3">Danh sách yêu thích trống</h2>
        <p className="text-muted">Hãy thêm sản phẩm yêu thích để xem lại sau.</p>
        <Link to="/all" className="btn btn-danger btn-lg mt-3">Xem Sản Phẩm</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h3 font-weight-bold mb-4">
        Danh Sách Yêu Thích ({wishlist.length} sản phẩm)
      </h1>

      <div className="row row-cols-2 row-cols-md-4 g-3">
        {wishlist.map((item) => {
          const sellPrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
          return (
            <div className="col" key={item.productCode}>
              <div className="card h-100 border-0 shadow-sm product-card">
                <Link to={`/${item.productCode}`} className="d-block position-relative">
                  <img
                    src={item.image ? `/images/${item.image}` : '/images/placeholder.jpg'}
                    alt={item.name}
                    className="card-img-top product-card__img"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                  />
                </Link>

                <div className="card-body d-flex flex-column p-3">
                  <Link to={`/${item.productCode}`} className="text-dark text-decoration-none">
                    <h6 className="card-title product-card__name mb-2">{item.name}</h6>
                  </Link>

                  <div className="mt-auto">
                    <div className="mb-2">
                      <span className="text-danger font-weight-bold">{formatVND(sellPrice)}</span>
                      {item.discountPrice > 0 && item.discountPrice < item.price && (
                        <small className="text-muted text-decoration-line-through ml-2">{formatVND(item.price)}</small>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => handleAddToCart(item)}
                        title="Thêm vào giỏ"
                      >
                        <FaShoppingCart size={12} className="mr-1" /> Thêm vào giỏ
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => dispatch(toggleWishlist(item))}
                        title="Xóa khỏi yêu thích"
                      >
                        <FaHeart size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link to="/all" className="btn btn-outline-secondary">← Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
};

export default WishlistPage;
