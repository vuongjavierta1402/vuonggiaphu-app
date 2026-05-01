import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductsDisplay from '../components/ProductsDisplay';
import ProductFilter from '../components/ProductFilter';
import Pagination from '../components/Pagination';

const SalesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page     = parseInt(searchParams.get('page') || '1', 10);
  const limit    = parseInt(searchParams.get('limit') || '24', 10);
  const sort     = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || undefined;
  const maxPrice = searchParams.get('maxPrice') || undefined;

  const { data, isLoading, error } = useProducts({
    page, limit, sort, minPrice, maxPrice, sale: true,
  });

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Khuyến Mãi</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 font-weight-bold mb-0">🔥 Sản Phẩm Khuyến Mãi</h1>
        {data?.total > 0 && (
          <small className="text-muted">{data.total} sản phẩm</small>
        )}
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <ProductFilter total={data?.total || 0} />
        </div>
        <div className="col-md-9">
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

export default SalesPage;
