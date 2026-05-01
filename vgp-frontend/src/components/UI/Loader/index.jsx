import React from 'react';

const Loader = ({ text = 'Đang tải...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5">
    <div className="spinner-border text-danger mb-3" role="status" style={{ width: 48, height: 48 }}>
      <span className="sr-only">Loading…</span>
    </div>
    <p className="text-muted">{text}</p>
  </div>
);

export default Loader;
