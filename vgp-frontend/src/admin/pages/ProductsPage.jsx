import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminProducts, useDeleteProduct, useImportProducts, useExportProducts,
  useToggleDisplay, useBulkDeleteProducts, useBulkSetDisplay,
} from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';
import { useAdminVouchers } from '../hooks/useAdminVouchers';

const formatVND = (n) => n?.toLocaleString('vi-VN') + '₫';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const { data, isLoading } = useAdminProducts(filters);
  const { data: catData } = useAdminCategories();
  const { data: voucherData } = useAdminVouchers({ limit: 100 });
  const deleteMutation = useDeleteProduct();
  const importMutation = useImportProducts();
  const toggleDisplay = useToggleDisplay();
  const bulkDelete = useBulkDeleteProducts();
  const bulkSetDisplay = useBulkSetDisplay();
  const { exportProducts, loading: exporting } = useExportProducts();

  const categories = catData?.data || [];
  const vouchers = voucherData?.data || [];
  const products = data?.products || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const setFilter = (key, val) => {
    setSelected(new Set());
    setFilters(f => ({ ...f, [key]: val, page: 1 }));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Single-row selection
  const toggleSelect = (code) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });

  // Select-all for current page
  const allPageCodes = products.map(p => p.productCode);
  const allPageSelected = allPageCodes.length > 0 && allPageCodes.every(c => selected.has(c));
  const somePageSelected = allPageCodes.some(c => selected.has(c));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        allPageCodes.forEach(c => next.delete(c));
        return next;
      });
    } else {
      setSelected(prev => new Set([...prev, ...allPageCodes]));
    }
  };

  const clearSelection = () => setSelected(new Set());

  // Delete single
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.productCode);
      setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.productCode); return n; });
      showToast('Đã xóa sản phẩm');
    } catch (e) {
      showToast(e?.error || 'Lỗi xóa sản phẩm', 'danger');
    }
    setDeleteTarget(null);
  };

  // Bulk delete
  const confirmBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync([...selected]);
      showToast(`Đã xóa ${selected.size} sản phẩm`);
      clearSelection();
    } catch (e) {
      showToast(e?.error || 'Lỗi xóa hàng loạt', 'danger');
    }
    setBulkDeleteModal(false);
  };

  // Bulk display toggle
  const handleBulkSetDisplay = async (isDisplay) => {
    try {
      await bulkSetDisplay.mutateAsync({ codes: [...selected], isDisplay });
      showToast(`Đã ${isDisplay ? 'hiển thị' : 'ẩn'} ${selected.size} sản phẩm`);
      clearSelection();
    } catch (e) {
      showToast(e?.error || 'Lỗi cập nhật', 'danger');
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const res = await importMutation.mutateAsync(importFile);
      setImportResult(res.data);
    } catch (e) {
      showToast(e?.error || 'Lỗi import', 'danger');
    }
  };

  const closeImport = () => { setImportModal(false); setImportFile(null); setImportResult(null); };

  const selectedCat = categories.find(c => c.name === filters.category);
  const bulkPending = bulkDelete.isPending || bulkSetDisplay.isPending;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 20, right: 20, zIndex: 9999, minWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Sản phẩm</h4>
          <small className="text-muted">{total} sản phẩm</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setImportModal(true)}>
            📥 Import Excel
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => exportProducts(filters)}
            disabled={exporting}
          >
            {exporting ? 'Đang xuất…' : '📤 Export Excel'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/products/new')}>
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                placeholder="Tìm theo tên / mã SP…"
                value={filters.search || ''}
                onChange={e => setFilter('search', e.target.value || undefined)}
              />
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filters.category || ''} onChange={e => setFilter('category', e.target.value || undefined)}>
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filters.subcategory || ''} onChange={e => setFilter('subcategory', e.target.value || undefined)} disabled={!selectedCat}>
                <option value="">Tất cả danh mục con</option>
                {(selectedCat?.subcategories || []).map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filters.voucherId || ''} onChange={e => setFilter('voucherId', e.target.value || undefined)}>
                <option value="">Tất cả voucher</option>
                {vouchers.map(v => <option key={v._id} value={v._id}>{v.code} — {v.name}</option>)}
              </select>
            </div>
            <div className="col-auto d-flex gap-2">
              <input className="form-control form-control-sm" style={{ width: 100 }} type="number" placeholder="Giá từ" value={filters.minPrice || ''} onChange={e => setFilter('minPrice', e.target.value || undefined)} />
              <input className="form-control form-control-sm" style={{ width: 100 }} type="number" placeholder="Giá đến" value={filters.maxPrice || ''} onChange={e => setFilter('maxPrice', e.target.value || undefined)} />
            </div>
            <div className="col-auto d-flex gap-2">
              <select className="form-select form-select-sm" style={{ width: 110 }} value={filters.sale !== undefined ? String(filters.sale) : ''} onChange={e => setFilter('sale', e.target.value === '' ? undefined : e.target.value)}>
                <option value="">Tất cả</option>
                <option value="true">Đang sale</option>
                <option value="false">Không sale</option>
              </select>
              <select className="form-select form-select-sm" style={{ width: 120 }} value={filters.isDisplay !== undefined ? String(filters.isDisplay) : ''} onChange={e => setFilter('isDisplay', e.target.value === '' ? undefined : e.target.value)}>
                <option value="">Mọi trạng thái</option>
                <option value="true">Đang hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="d-flex align-items-center gap-2 mb-2 px-1 py-2 rounded" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <span className="text-primary fw-semibold small">Đã chọn {selected.size} sản phẩm</span>
          <button className="btn btn-outline-success btn-sm" disabled={bulkPending} onClick={() => handleBulkSetDisplay(true)}>Hiển thị</button>
          <button className="btn btn-outline-secondary btn-sm" disabled={bulkPending} onClick={() => handleBulkSetDisplay(false)}>Ẩn</button>
          <button className="btn btn-outline-danger btn-sm" disabled={bulkPending} onClick={() => setBulkDeleteModal(true)}>Xóa</button>
          <button className="btn btn-link btn-sm text-muted p-0 ms-auto" onClick={clearSelection}>Bỏ chọn</button>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={toggleSelectAll}
                    disabled={products.length === 0}
                  />
                </th>
                <th style={{ width: 50 }}>Ảnh</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th className="text-end">Giá</th>
                <th className="text-end">Giá sale</th>
                <th className="text-center">Hiển thị</th>
                <th className="text-center">Sale</th>
                <th className="text-end" style={{ width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="text-center py-4 text-muted">Đang tải…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-4 text-muted">Không có sản phẩm</td></tr>
              ) : products.map(p => (
                <tr key={p._id} className={selected.has(p.productCode) ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.has(p.productCode)}
                      onChange={() => toggleSelect(p.productCode)}
                    />
                  </td>
                  <td>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.src = '/images/placeholder.jpg'; }} />
                      : <div style={{ width: 40, height: 40, background: '#e2e8f0', borderRadius: 4 }} />
                    }
                  </td>
                  <td className="text-muted">{p.productCode}</td>
                  <td style={{ maxWidth: 260 }} className="text-truncate">{p.name}</td>
                  <td className="text-muted">{p.category}{p.subcategory ? ` / ${p.subcategory}` : ''}</td>
                  <td className="text-end">{formatVND(p.price)}</td>
                  <td className="text-end">{p.discountPrice > 0 ? formatVND(p.discountPrice) : '—'}</td>
                  <td className="text-center">
                    <div className="form-check form-switch d-flex justify-content-center mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!p.isDisplay}
                        disabled={toggleDisplay.isPending}
                        onChange={() => toggleDisplay.mutate({ code: p.productCode, isDisplay: !p.isDisplay })}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    {p.sale ? <span className="badge bg-danger">Sale</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-link btn-sm p-0 me-2" onClick={() => navigate(`/admin/products/${p.productCode}`)}>Sửa</button>
                    <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => setDeleteTarget(p)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="card-footer d-flex align-items-center justify-content-between py-2">
            <small className="text-muted">Trang {filters.page} / {pages}</small>
            <div className="d-flex gap-1">
              <button className="btn btn-outline-secondary btn-sm" disabled={filters.page <= 1} onClick={() => { setFilters(f => ({ ...f, page: f.page - 1 })); clearSelection(); }}>‹</button>
              <button className="btn btn-outline-secondary btn-sm" disabled={filters.page >= pages} onClick={() => { setFilters(f => ({ ...f, page: f.page + 1 })); clearSelection(); }}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete single modal */}
      {deleteTarget && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: 40 }}>🗑️</div>
                <p className="mb-1 fw-semibold mt-2">Xóa sản phẩm?</p>
                <p className="text-muted small mb-0">{deleteTarget.name}</p>
              </div>
              <div className="modal-footer justify-content-center border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Hủy</button>
                <button className="btn btn-danger btn-sm" onClick={confirmDelete} disabled={deleteMutation.isPending}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm modal */}
      {bulkDeleteModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: 40 }}>🗑️</div>
                <p className="mb-1 fw-semibold mt-2">Xóa {selected.size} sản phẩm?</p>
                <p className="text-muted small mb-0">Hành động này không thể hoàn tác.</p>
              </div>
              <div className="modal-footer justify-content-center border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkDeleteModal(false)}>Hủy</button>
                <button className="btn btn-danger btn-sm" onClick={confirmBulkDelete} disabled={bulkDelete.isPending}>Xóa tất cả</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Import sản phẩm từ Excel</h5>
                <button className="btn-close" onClick={closeImport} />
              </div>
              <div className="modal-body">
                {!importResult ? (
                  <>
                    <p className="text-muted small mb-3">
                      File Excel (.xlsx, .xls) hoặc CSV (.csv) cần có các cột: <code>productCode, name, price</code> (bắt buộc).<br />
                      Tùy chọn: <code>discountPrice, brand, category, subcategory, quantity, description, images, sale, highlighted, isDisplay</code>.<br />
                      Cột <code>images</code>: các URL cách nhau bằng dấu phẩy. Import sẽ tạo mới hoặc cập nhật theo <code>productCode</code>.
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="form-control"
                      ref={fileRef}
                      onChange={e => setImportFile(e.target.files[0])}
                    />
                  </>
                ) : (
                  <div>
                    <div className="d-flex gap-3 mb-3">
                      <div className="text-center flex-fill p-3 rounded" style={{ background: '#f0fdf4' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{importResult.imported}</div>
                        <div className="text-muted small">Tạo mới</div>
                      </div>
                      <div className="text-center flex-fill p-3 rounded" style={{ background: '#eff6ff' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{importResult.updated}</div>
                        <div className="text-muted small">Cập nhật</div>
                      </div>
                      <div className="text-center flex-fill p-3 rounded" style={{ background: importResult.errors.length ? '#fef2f2' : '#f8fafc' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: importResult.errors.length ? '#dc2626' : '#64748b' }}>{importResult.errors.length}</div>
                        <div className="text-muted small">Lỗi</div>
                      </div>
                    </div>
                    {importResult.errors.length > 0 && (
                      <div style={{ maxHeight: 160, overflowY: 'auto', background: '#fef2f2', borderRadius: 6, padding: '8px 12px' }}>
                        {importResult.errors.map((e, i) => (
                          <div key={i} className="text-danger small">Dòng {e.row}: {e.error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary btn-sm" onClick={closeImport}>Đóng</button>
                {!importResult && (
                  <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={!importFile || importMutation.isPending}>
                    {importMutation.isPending ? 'Đang import…' : 'Import'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
