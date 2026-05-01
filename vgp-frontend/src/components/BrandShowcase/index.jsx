import React from 'react';
import { Link } from 'react-router-dom';
import storeConfig from '../../config/store';

const BrandShowcase = () => {
  const { brands } = storeConfig;

  return (
    <section className="container my-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="h4 font-weight-bold mb-0">Thương Hiệu Nổi Tiếng</h2>
        <Link to="/all" className="btn btn-outline-danger btn-sm">
          Xem tất cả →
        </Link>
      </div>

      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-7 g-3">
        {brands.map((brand) => (
          <div className="col" key={brand.slug}>
            <Link
              to={`/all?brand=${encodeURIComponent(brand.slug)}`}
              className="text-decoration-none"
            >
              <div className="brand-card card h-100 border text-center p-3 d-flex align-items-center justify-content-center">
                <span className="brand-card__name font-weight-bold text-dark" style={{ fontSize: '0.85rem' }}>
                  {brand.name}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandShowcase;
