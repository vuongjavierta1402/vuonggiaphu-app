import React from 'react';
import ProductCard from '../ProductCard';
import Loader from '../UI/Loader';

const ProductsDisplay = ({ products, isLoading, error }) => {
  if (isLoading) return <Loader />;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Không thể tải sản phẩm: {error.message}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Không có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
      {products.map((product) => (
        <div className="col" key={product.productCode}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductsDisplay;
