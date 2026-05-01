import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div style={{ fontSize: 64 }}>⚠️</div>
          <h2 className="font-weight-bold mt-3">Đã xảy ra lỗi</h2>
          <p className="text-muted mb-4">
            Trang này gặp sự cố. Vui lòng tải lại hoặc quay về trang chủ.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
            <a href="/" className="btn btn-outline-secondary">
              Về trang chủ
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 text-left small text-danger bg-light p-3 rounded" style={{ maxHeight: 200, overflow: 'auto' }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
