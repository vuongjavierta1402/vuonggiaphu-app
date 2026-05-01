import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useProduct, useSimilarProducts } from '../hooks/useProducts';
import { addToCart } from '../store/slices/cartSlice';
import { showModal } from '../store/slices/uiSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { formatVND, discountPercent, imgSrc } from '../utils/currency';
import Ratings from '../components/Ratings';
import ProductCard from '../components/ProductCard';
import Loader from '../components/UI/Loader';
import { FaHeart, FaRegHeart, FaMinus, FaPlus } from 'react-icons/fa';

const MAX_CART = 10;

const ProductDetailsPage = () => {
  const { productCode } = useParams();
  const dispatch        = useDispatch();
  const [qty, setQty]   = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const cartItems   = useSelector((s) => s.cart.items);
  const wishlist    = useSelector((s) => s.wishlist.items);

  const { data: product, isLoading, error } = useProduct(productCode);
  const { data: similar }                   = useSimilarProducts(productCode, 4);

  if (isLoading) return <Loader />;

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-muted">Không tìm thấy sản phẩm</h2>
        <Link to="/all" className="btn btn-danger mt-3">Xem tất cả sản phẩm</Link>
      </div>
    );
  }

  const {
    name, price, discountPrice, images = [], description,
    brand, category, subcategory, ratings, relatedProducts = [], partProducts = [], attachments = [],
  } = product;

  const sellPrice  = discountPrice && discountPrice > 0 ? discountPrice : price;
  const discount   = discountPercent(product);
  const cartItem   = cartItems.find((i) => i.productCode === productCode);
  const cartQty    = cartItem?.quantity || 0;
  const inWishlist = wishlist.some((i) => i.productCode === productCode);

  const handleAddToCart = () => {
    if (cartQty + qty > MAX_CART) {
      dispatch(showModal(`Bạn đã thêm tối đa ${MAX_CART} sản phẩm vào giỏ hàng.`));
      return;
    }
    dispatch(addToCart({
      productCode,
      name,
      price,
      discountPrice,
      image: images[0] || '',
      quantity: qty,
    }));
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist({ productCode, name, price, discountPrice, image: images[0] || '' }));
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/all">Sản phẩm</Link></li>
          <li className="breadcrumb-item active text-truncate" style={{ maxWidth: 200 }}>{name}</li>
        </ol>
      </nav>

      <div className="row">
        {/* Image Gallery */}
        <div className="col-md-5 mb-4">
          <div className="border rounded overflow-hidden mb-2" style={{ background: '#f8f9fa' }}>
            <img
              src={imgSrc(images[activeImg])}
              alt={name}
              className="w-100"
              style={{ maxHeight: 420, objectFit: 'contain' }}
              onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {images.slice(0, 6).map((img, i) => (
              <img
                key={i}
                src={imgSrc(img)}
                alt={`${name} ${i + 1}`}
                className={`border rounded cursor-pointer ${activeImg === i ? 'border-danger' : ''}`}
                style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setActiveImg(i)}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <h1 className="h4 font-weight-bold mb-2">{name}</h1>

          <div className="mb-2 d-flex align-items-center gap-3">
            <Ratings rating={ratings?.star_ratings || 0} votes={ratings?.votes || 0} />
            {brand && (
              <Link to={`/all?brand=${encodeURIComponent(brand)}`} className="badge badge-secondary text-decoration-none">
                {brand}
              </Link>
            )}
          </div>

          <div className="mb-3">
            <span className="text-danger h3 font-weight-bold">{formatVND(sellPrice)}</span>
            {discount > 0 && (
              <>
                <small className="text-muted text-decoration-line-through ml-2">{formatVND(price)}</small>
                <span className="badge badge-danger ml-2">-{discount}%</span>
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <label className="mb-0 font-weight-bold">Số lượng:</label>
            <div className="input-group" style={{ width: 130 }}>
              <div className="input-group-prepend">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <FaMinus size={10} />
                </button>
              </div>
              <input
                type="number"
                className="form-control text-center"
                value={qty}
                min={1}
                max={MAX_CART}
                onChange={(e) => setQty(Math.min(MAX_CART, Math.max(1, parseInt(e.target.value) || 1)))}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setQty(Math.min(MAX_CART, qty + 1))}
                >
                  <FaPlus size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 mb-4">
            <button className="btn btn-danger btn-lg flex-fill" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button
              className={`btn btn-lg ${inWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={handleWishlist}
              title={inWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              {inWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Product meta */}
          <div className="small text-muted">
            <div><strong>Mã sản phẩm:</strong> {productCode}</div>
            {brand      && <div><strong>Thương hiệu:</strong> {brand}</div>}
            {category   && <div><strong>Danh mục:</strong> {category}</div>}
            {subcategory && <div><strong>Phân loại:</strong> {subcategory}</div>}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-3">
              <h6 className="font-weight-bold">Tài liệu đính kèm:</h6>
              <ul className="list-unstyled small">
                {attachments.map((a, i) => (
                  <li key={i}>
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-danger">
                      📄 {a.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <section className="mt-5">
          <h3 className="h5 font-weight-bold border-bottom pb-2 mb-3">Mô Tả Sản Phẩm</h3>
          <div
            className="product-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}

      {/* Part / Combo products */}
      {partProducts.length > 0 && (
        <section className="mt-5">
          <h3 className="h5 font-weight-bold border-bottom pb-2 mb-3">Sản Phẩm Mua Kèm</h3>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {partProducts.map((p) => (
              <div className="col" key={p.productCode}>
                <div className="card h-100 border-0 shadow-sm p-2">
                  <Link to={`/${p.productCode}`}>
                    <img
                      src={imgSrc(p.image)}
                      alt={p.name}
                      className="w-100 mb-2"
                      style={{ height: 100, objectFit: 'contain' }}
                      onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                    />
                  </Link>
                  <Link to={`/${p.productCode}`} className="text-dark small font-weight-bold text-decoration-none">
                    {p.name}
                  </Link>
                  <span className="text-danger small">{formatVND(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar products */}
      {similar && similar.length > 0 && (
        <section className="mt-5">
          <h3 className="h5 font-weight-bold border-bottom pb-2 mb-3">Sản Phẩm Tương Tự</h3>
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {similar.map((p) => (
              <div className="col" key={p.productCode}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;
