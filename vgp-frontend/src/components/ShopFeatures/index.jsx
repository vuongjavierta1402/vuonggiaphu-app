import React from 'react';
import storeConfig from '../../config/store';

const ShopFeatures = () => (
  <div className="shop-features bg-light py-4 border-top border-bottom">
    <div className="container">
      <div className="row text-center">
        {storeConfig.features.map((f) => (
          <div key={f.title} className="col-6 col-md-3 mb-3 mb-md-0">
            <div style={{ fontSize: 36 }}>{f.icon}</div>
            <p className="font-weight-bold mb-0 small mt-2">{f.title}</p>
            <p className="text-muted small mb-0">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ShopFeatures;
