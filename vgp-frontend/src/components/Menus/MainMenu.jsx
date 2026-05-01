import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import storeConfig from '../../config/store';

const MainMenu = () => {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <nav className="main-menu navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <ul className="navbar-nav mr-auto flex-row flex-wrap">

          {/* All Products */}
          <li className="nav-item mr-1">
            <NavLink to="/all" className="nav-link px-3 py-2 font-weight-bold">
              Tất Cả SP
            </NavLink>
          </li>

          {/* Category dropdowns */}
          {CATEGORIES.map((cat) => (
            <li
              key={cat.slug}
              className="nav-item dropdown mr-1"
              onMouseEnter={() => setOpenMenu(cat.slug)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <span className="nav-link dropdown-toggle px-3 py-2" style={{ cursor: 'pointer' }}>
                {cat.icon} {cat.label}
              </span>
              {openMenu === cat.slug && cat.subcategories.length > 0 && (
                <div className="dropdown-menu show shadow" style={{ minWidth: 220 }}>
                  <Link
                    to={`/category/${cat.slug}/${cat.subcategories[0]?.slug || ''}`}
                    className="dropdown-item font-weight-bold"
                    state={{ category: cat.dbValue }}
                  >
                    Tất cả {cat.label}
                  </Link>
                  <div className="dropdown-divider" />
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      to={`/category/${cat.slug}/${sub.slug}`}
                      className="dropdown-item"
                      state={{ category: cat.dbValue, subcategory: sub.dbValue }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}

          {/* Brands dropdown */}
          <li
            className="nav-item dropdown mr-1"
            onMouseEnter={() => setOpenMenu('brands')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <span className="nav-link dropdown-toggle px-3 py-2" style={{ cursor: 'pointer' }}>
              Thương Hiệu
            </span>
            {openMenu === 'brands' && (
              <div className="dropdown-menu show shadow" style={{ minWidth: 200 }}>
                {storeConfig.brands.map((b) => (
                  <Link
                    key={b.slug}
                    to={`/all?brand=${encodeURIComponent(b.slug)}`}
                    className="dropdown-item"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Sale */}
          <li className="nav-item">
            <NavLink to="/sale" className="nav-link px-3 py-2 font-weight-bold text-danger">
              🔥 Khuyến Mãi
            </NavLink>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default MainMenu;
