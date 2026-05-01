import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaSearch, FaBars, FaTimes, FaPhone, FaHeart } from 'react-icons/fa';
import MainMenu from '../components/Menus/MainMenu';
import Footer from '../components/Footer';
import Modal from '../components/UI/Modal';
import { closeModal } from '../store/slices/uiSlice';
import { CATEGORIES } from '../utils/constants';
import storeConfig from '../config/store';

const MainLayout = ({ children }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [query, setQuery]       = useState('');
  const [sideOpen, setSideOpen] = useState(false);

  const cartTotal           = useSelector((s) => s.cart.cartTotal);
  const wishlistCount       = useSelector((s) => s.wishlist.items.length);
  const productMaxShowModal = useSelector((s) => s.ui.productMaxShowModal);
  const modalMessage        = useSelector((s) => s.ui.modalMessage);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/all?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSideOpen(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ── Top bar (hotline) ─────────────────────────────── */}
      <div className="top-bar bg-dark text-light py-1 d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="small text-secondary">{storeConfig.workingHours}</span>
          <div className="d-flex gap-3">
            {storeConfig.hotlines.map((h) => (
              <a key={h} href={`tel:${h.replace(/\s/g, '')}`} className="small text-light text-decoration-none d-flex align-items-center gap-1">
                <FaPhone size={10} className="text-danger" /> {h}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────── */}
      <header className="bg-white shadow-sm sticky-top">
        <div className="container py-2">
          <div className="d-flex align-items-center gap-3">

            {/* Logo */}
            <Link to="/" className="text-decoration-none flex-shrink-0">
              <div className="d-flex flex-column">
                <span className="font-weight-bold" style={{ fontSize: 20, lineHeight: 1.2, color: 'var(--color-primary)' }}>
                  {storeConfig.name}
                </span>
                <small className="text-muted" style={{ fontSize: 10 }}>
                  {storeConfig.tagline}
                </small>
              </div>
            </Link>

            {/* Search bar — desktop */}
            <form onSubmit={handleSearch} className="flex-grow-1 d-none d-md-flex">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="input-group-append">
                  <button type="submit" className="btn btn-danger px-3">
                    <FaSearch />
                  </button>
                </div>
              </div>
            </form>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {/* Wishlist */}
              <Link to="/wishlist" className="btn btn-outline-secondary position-relative d-none d-md-inline-flex" title="Yêu thích">
                <FaHeart size={16} />
                {wishlistCount > 0 && (
                  <span className="badge badge-danger position-absolute" style={{ top: -6, right: -6, fontSize: 10 }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="btn btn-outline-danger position-relative">
                <FaShoppingCart size={18} />
                {cartTotal > 0 && (
                  <span className="badge badge-danger position-absolute" style={{ top: -6, right: -6, fontSize: 10 }}>
                    {cartTotal}
                  </span>
                )}
              </Link>

              {/* Hamburger — mobile */}
              <button
                className="btn btn-outline-secondary d-md-none"
                onClick={() => setSideOpen(true)}
                aria-label="Mở menu"
              >
                <FaBars />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mt-2 d-md-none">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-danger">
                  <FaSearch />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Desktop nav menu */}
        <MainMenu />
      </header>

      {/* ── Mobile sidebar drawer ────────────────────────────── */}
      {sideOpen && (
        <div
          className="position-fixed w-100 h-100"
          style={{ top: 0, left: 0, zIndex: 1050, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSideOpen(false)}
        />
      )}
      <div
        className="position-fixed bg-white h-100 overflow-auto"
        style={{
          top: 0, left: 0, width: 300, zIndex: 1060,
          transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
        }}
      >
        {/* Sidebar header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ background: 'var(--color-primary)' }}>
          <span className="text-white font-weight-bold">{storeConfig.name}</span>
          <button className="btn btn-sm text-white" onClick={() => setSideOpen(false)} aria-label="Đóng menu">
            <FaTimes />
          </button>
        </div>

        {/* Sidebar nav */}
        <nav className="p-3">
          <NavLink to="/all" className="d-block py-2 px-3 rounded mb-1 sidebar-link font-weight-bold" onClick={() => setSideOpen(false)}>
            Tất Cả Sản Phẩm
          </NavLink>

          {CATEGORIES.map((cat) => (
            <div key={cat.slug} className="mb-2">
              <div className="py-2 px-3 text-muted small font-weight-bold text-uppercase">
                {cat.icon} {cat.label}
              </div>
              {cat.subcategories.map((sub) => (
                <NavLink
                  key={sub.slug}
                  to={`/category/${cat.slug}/${sub.slug}`}
                  state={{ category: cat.dbValue, subcategory: sub.dbValue }}
                  className="d-block py-1 px-4 rounded mb-1 sidebar-link"
                  onClick={() => setSideOpen(false)}
                >
                  {sub.label}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="border-top my-2" />

          <NavLink to="/sale" className="d-block py-2 px-3 rounded mb-1 sidebar-link font-weight-bold text-danger" onClick={() => setSideOpen(false)}>
            🔥 Khuyến Mãi
          </NavLink>
          <NavLink to="/wishlist" className="d-block py-2 px-3 rounded mb-1 sidebar-link" onClick={() => setSideOpen(false)}>
            ❤️ Yêu Thích
            {wishlistCount > 0 && (
              <span className="badge badge-danger ml-2">{wishlistCount}</span>
            )}
          </NavLink>
          <NavLink to="/cart" className="d-block py-2 px-3 rounded mb-1 sidebar-link" onClick={() => setSideOpen(false)}>
            🛒 Giỏ Hàng
            {cartTotal > 0 && (
              <span className="badge badge-danger ml-2">{cartTotal}</span>
            )}
          </NavLink>

          <div className="border-top my-3 pt-2">
            {storeConfig.hotlines.map((h) => (
              <a key={h} href={`tel:${h.replace(/\s/g, '')}`} className="d-flex align-items-center gap-2 py-2 px-3 text-dark text-decoration-none">
                <FaPhone size={12} className="text-danger" /> {h}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-grow-1">
        {children}
      </main>

      <Footer />

      <Modal
        show={productMaxShowModal}
        message={modalMessage}
        onClose={() => dispatch(closeModal())}
      />
    </div>
  );
};

export default MainLayout;
