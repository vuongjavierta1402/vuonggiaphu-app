import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductsDisplay from '../components/ProductsDisplay';
import ProductFilter from '../components/ProductFilter';
import Pagination from '../components/Pagination';
import { PAGE_SIZES } from '../utils/constants';

const AllProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page        = parseInt(searchParams.get('page') || '1', 10);
  const limit       = parseInt(searchParams.get('limit') || '24', 10);
  const sort        = searchParams.get('sort') || 'newest';
  const minPrice    = searchParams.get('minPrice') || undefined;
  const maxPrice    = searchParams.get('maxPrice') || undefined;
  const brand       = searchParams.get('brand') || undefined;
  const highlighted = searchParams.get('highlighted') || undefined;
  const q           = searchParams.get('q') || undefined;

  const { data, isLoading, error } = useProducts({
    page, limit, sort, minPrice, maxPrice, brand, highlighted, q,
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

  const title = q
    ? `Kết quả tìm kiếm: "${q}"`
    : brand
    ? `Thương hiệu: ${brand}`
    : 'Tất Cả Sản Phẩm';

  return (
    <div className="container py-4">
      <h1 className="h3 font-weight-bold mb-4">{title}</h1>

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

export default AllProductsPage;
