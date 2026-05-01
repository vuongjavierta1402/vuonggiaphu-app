import React from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES, PAGE_SIZES } from '../utils/constants';
import ProductsDisplay from '../components/ProductsDisplay';
import ProductFilter from '../components/ProductFilter';
import Pagination from '../components/Pagination';

const ProductCategoriesPage = () => {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve DB values from slug or from router state (passed via Link)
  const stateCategory    = location.state?.category;
  const stateSubcategory = location.state?.subcategory;

  const catDef = CATEGORIES.find((c) => c.slug === categorySlug);
  const subDef = catDef?.subcategories.find((s) => s.slug === subcategorySlug);

  const dbCategory    = stateCategory    || catDef?.dbValue    || categorySlug;
  const dbSubcategory = stateSubcategory || subDef?.dbValue    || subcategorySlug;

  const page     = parseInt(searchParams.get('page') || '1', 10);
  const limit    = parseInt(searchParams.get('limit') || '24', 10);
  const sort     = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || undefined;
  const maxPrice = searchParams.get('maxPrice') || undefined;

  const { data, isLoading, error } = useProducts({
    page, limit, sort, minPrice, maxPrice,
    category:    dbCategory,
    subcategory: dbSubcategory,
  });

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  const setLimit = (l) => {
    const next = new URLSearchParams(searchParams);
    next.set('limit', l);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          {catDef && (
            <li className="breadcrumb-item">
              <Link to={`/category/${catDef.slug}/${catDef.subcategories[0]?.slug}`}>
                {catDef.label}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active">{subDef?.label || subcategorySlug}</li>
        </ol>
      </nav>

      <h1 className="h3 font-weight-bold mb-4">{subDef?.label || subcategorySlug}</h1>

      {/* Subcategory tabs */}
      {catDef?.subcategories.length > 0 && (
        <div className="mb-4 d-flex flex-wrap gap-2">
          {catDef.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              to={`/category/${catDef.slug}/${sub.slug}`}
              state={{ category: catDef.dbValue, subcategory: sub.dbValue }}
              className={`btn btn-sm ${sub.slug === subcategorySlug ? 'btn-danger' : 'btn-outline-secondary'}`}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}

      <div className="row">
        <div className="col-md-3 mb-4">
          <ProductFilter total={data?.total || 0} />
        </div>

        <div className="col-md-9">
          <div className="d-flex align-items-center gap-2 mb-3">
            <small className="text-muted mr-2">Hiển thị:</small>
            {PAGE_SIZES.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${limit === s ? 'btn-danger' : 'btn-outline-secondary'}`}
                onClick={() => setLimit(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <ProductsDisplay
            products={data?.products}
            isLoading={isLoading}
            error={error}
          />

          <Pagination
            page={data?.page || page}
            pages={data?.pages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCategoriesPage;
