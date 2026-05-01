import React from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useSaleProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import Loader from '../components/UI/Loader';
import ShopFeatures from '../components/ShopFeatures';
import HeroBanner from '../components/HeroBanner';
import BrandShowcase from '../components/BrandShowcase';
import Showrooms from '../components/Showrooms';
import { CATEGORIES } from '../utils/constants';

const SectionTitle = ({ title, linkTo, linkLabel }) => (
  <div className="d-flex align-items-center justify-content-between mb-4">
    <h2 className="h4 font-weight-bold mb-0">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="btn btn-outline-danger btn-sm">
        {linkLabel || 'Xem tất cả →'}
      </Link>
    )}
  </div>
);

const HomePage = () => {
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts(8);
  const { data: saleData, isLoading: loadingSale }     = useSaleProducts(1, 8);

  return (
    <div>
      {/* Hero Carousel */}
      <HeroBanner />

      {/* Trust Badges */}
      <ShopFeatures />

      {/* Category Grid */}
      <section className="container my-5">
        <SectionTitle title="Danh Mục Sản Phẩm" />
        <div className="row row-cols-2 row-cols-md-3 g-3">
          {CATEGORIES.map((cat) => (
            <div className="col" key={cat.slug}>
              <Link
                to={`/category/${cat.slug}/${cat.subcategories[0]?.slug || ''}`}
                state={{ category: cat.dbValue }}
                className="text-decoration-none"
              >
                <div className="card h-100 border-0 shadow-sm text-center p-4 category-card">
                  <div style={{ fontSize: 48 }}>{cat.icon}</div>
                  <h5 className="mt-3 mb-0 text-dark">{cat.label}</h5>
                  {cat.subcategories.length > 0 && (
                    <small className="text-muted mt-1">
                      {cat.subcategories.length} danh mục
                    </small>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container my-5">
        <SectionTitle title="Sản Phẩm Nổi Bật" linkTo="/all?highlighted=true" />
        {loadingFeatured ? (
          <Loader />
        ) : (
          <div className="row row-cols-2 row-cols-md-4 g-3">
            {(featured || []).map((product) => (
              <div className="col" key={product.productCode}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Sale Products */}
      <section className="bg-light py-5">
        <div className="container">
          <SectionTitle title="🔥 Sản Phẩm Khuyến Mãi" linkTo="/sale" />
          {loadingSale ? (
            <Loader />
          ) : (
            <div className="row row-cols-2 row-cols-md-4 g-3">
              {(saleData?.products || []).map((product) => (
                <div className="col" key={product.productCode}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Showrooms */}
      <Showrooms />
    </div>
  );
};

export default HomePage;
