import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { showModal } from '../../store/slices/uiSlice';
import { formatVND, discountPercent, imgSrc } from '../../utils/currency';
import Ratings from '../Ratings';

const MAX_CART = 10;

const ProductCard = ({ product }) => {
  const dispatch  = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);

  if (!product) return null;

  const {
    productCode,
    name,
    price,
    discountPrice,
    images,
    sale,
    highlighted,
    ratings,
  } = product;

  const image       = imgSrc(images?.[0]);
  const sellPrice   = discountPrice && discountPrice > 0 ? discountPrice : price;
  const discount    = discountPercent(product);
  const cartItem    = cartItems.find((i) => i.productCode === productCode);
  const cartQty     = cartItem?.quantity || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (cartQty >= MAX_CART) {
      dispatch(showModal(`Bạn đã thêm tối đa ${MAX_CART} sản phẩm "${name}" vào giỏ hàng.`));
      return;
    }
    dispatch(addToCart({
      productCode,
      name,
      price,
      discountPrice,
      image: images?.[0] || '',
      quantity: 1,
    }));
  };

  return (
    <div className="card product-card h-100 border-0 shadow-sm">
      <Link to={`/${productCode}`} className="position-relative d-block">
        {sale && (
          <span className="badge badge-danger position-absolute" style={{ top: 8, left: 8, zIndex: 1 }}>
            SALE
          </span>
        )}
        {discount > 0 && (
          <span className="badge badge-warning position-absolute text-dark" style={{ top: 8, right: 8, zIndex: 1 }}>
            -{discount}%
          </span>
        )}
        <img
          src={image}
          alt={name}
          className="card-img-top product-card__img"
          loading="lazy"
          onError={(e) => { e.target.src = '/images/placeholder.jpg'; e.target.onerror = null; }}
        />
      </Link>

      <div className="card-body d-flex flex-column p-3">
        <Link to={`/${productCode}`} className="text-dark text-decoration-none">
          <h6 className="card-title product-card__name mb-1">{name}</h6>
        </Link>

        <div className="mb-2">
          <Ratings rating={ratings?.star_ratings || 0} votes={ratings?.votes || 0} />
        </div>

        <div className="mt-auto">
          <div className="product-card__price">
            <span className="text-danger font-weight-bold">{formatVND(sellPrice)}</span>
            {discount > 0 && (
              <small className="text-muted text-decoration-line-through ml-2">
                {formatVND(price)}
              </small>
            )}
          </div>
          <button
            className="btn btn-danger btn-sm btn-block mt-2"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
