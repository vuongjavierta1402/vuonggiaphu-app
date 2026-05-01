import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SORT_OPTIONS } from '../../utils/constants';

const ProductFilter = ({ total }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const currentSort = searchParams.get('sort') || 'newest';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice); else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="product-filter">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <small className="text-muted">{total} sản phẩm</small>

        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 text-nowrap small">Sắp xếp:</label>
          <select
            className="form-control form-control-sm"
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-3 mb-3">
        <h6 className="mb-3">Lọc theo giá (đ)</h6>
        <div className="d-flex gap-2 align-items-center mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-danger btn-sm flex-fill" onClick={applyPriceFilter}>
            Áp dụng
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
