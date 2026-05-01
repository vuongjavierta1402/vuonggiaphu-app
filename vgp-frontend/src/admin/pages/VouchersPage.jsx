import { useState } from 'react';
import {
  useAdminVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
} from '../hooks/useAdminVouchers';
import { useAdminCategories } from '../hooks/useAdminCategories';
import { useAdminProducts } from '../hooks/useAdminProducts';

const emptyForm = {
  code: '', name: '', description: '',
  discountType: 'percentage', discountValue: '',
  active: true,
  startDate: '', endDate: '',
  usageLimit: '',
  applyTo: 'all',
  categories: [],
  products: [],
};

const fmt = (n) => n?.toLocaleString('vi-VN');

export default function VouchersPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  const { data, isLoading } = useAdminVouchers(filters);
  const { data: catData } = useAdminCategories();
  const { data: prodData } = useAdminProducts({ limit: 50, search: productSearch || undefined });
  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  const vouchers = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const categories = catData?.data || [];
  const products = prodData?.products || [];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => { setForm(emptyForm); setModal({ mode: 'create' }); };
  const openEdit = (v) => {
    setForm({
      code:          v.code,
      name:          v.name,
      description:   v.description || '',
      discountType:  v.discountType,
      discountValue: v.discountValue,
      active:        v.active,
      startDate:     v.startDate ? v.startDate.slice(0, 10) : '',
      endDate:       v.endDate   ? v.endDate.slice(0, 10)   : '',
      usageLimit:    v.usageLimit ?? '',
      applyTo:       v.applyTo,
      categories:    v.categories || [],
      products:      v.products   || [],
    });
    setModal({ mode: 'edit', id: v._id });
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (name) =>
    setForm(f => ({
      ...f,
      categories: f.categories.includes(name)
        ? f.categories.filter(c => c !== name)
        : [...f.categories, name],
    }));

  const toggleProduct = (code) =>
    setForm(f => ({
      ...f,
      products: f.products.includes(code)
        ? f.products.filter(c => c !== code)
        : [...f.products, code],
    }));

  const handleSave = async () => {
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      usageLimit:    form.usageLimit !== '' ? Number(form.usageLimit) : null,
      startDate:     form.startDate || null,
      endDate:       form.endDate   || null,
      categories:    form.applyTo === 'categories' ? form.categories : [],
      products:      form.applyTo === 'products'   ? form.products   : [],
    };
    try {
      if (modal.mode === 'create') {
        await createMutation.mutateAsync(payload);
        showToast('Đã tạo voucher');
      } else {
        await updateMutation.mutateAsync({ id: modal.id, data: payload });
        showToast('Đã cập nhật voucher');
      }
      setModal(null);
    } catch (e) {
      showToast(e?.error || 'Lỗi lưu voucher', 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      showToast('Đã xóa voucher');
    } catch (e) {
      showToast(e?.error || 'Lỗi xóa', 'danger');
    }
    setDeleteTarget(null);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const discountLabel = (v) =>
    v.discountType === 'percentage'
      ? `${v.discountValue}%`
      : `${fmt(v.discountValue)}₫`;

  const applyLabel = (v) => {
    if (v.applyTo === 'all') return 'Tất cả';
    if (v.applyTo === 'categories') return `${v.categories?.length || 0} danh mục`;
    return `${v.products?.length || 0} sản phẩm`;
  };

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 20, right: 20, zIndex: 9999, minWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Voucher</h4>
          <small className="text-muted">{total} voucher</small>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm voucher</button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-3">
          <div className="row g-2">
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="Tìm theo mã / tên…" value={filters.search || ''}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined, page: 1 }))} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filters.active !== undefined ? String(filters.active) : ''}
                onChange={e => setFilters(f => ({ ...f, active: e.target.value === '' ? undefined : e.target.value, page: 1 }))}>
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Tắt</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Giảm giá</th>
                <th>Áp dụng cho</th>
                <th>Thời gian</th>
                <th>Sử dụng</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-4 text-muted">Đang tải…</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-4 text-muted">Không có voucher</td></tr>
              ) : vouchers.map(v => (
                <tr key={v._id}>
                  <td className="fw-bold font-monospace">{v.code}</td>
                  <td>{v.name}</td>
                  <td className="text-danger fw-semibold">{discountLabel(v)}</td>
                  <td className="text-muted">{applyLabel(v)}</td>
                  <td className="text-muted" style={{ fontSize: 12 }}>
                    {v.startDate ? new Date(v.startDate).toLocaleDateString('vi-VN') : '∞'}
                    {' — '}
                    {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '∞'}
                  </td>
                  <td className="text-muted">
                    {v.usageCount}{v.usageLimit ? ` / ${v.usageLimit}` : ''}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${v.active ? 'bg-success' : 'bg-secondary'}`}>{v.active ? 'Bật' : 'Tắt'}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-link btn-sm p-0 me-2" onClick={() => openEdit(v)}>Sửa</button>
                    <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => setDeleteTarget(v)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="card-footer d-flex align-items-center justify-content-between py-2">
            <small className="text-muted">Trang {filters.page} / {pages}</small>
            <div className="d-flex gap-1">
              <button className="btn btn-outline-secondary btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>‹</button>
              <button className="btn btn-outline-secondary btn-sm" disabled={filters.page >= pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal.mode === 'create' ? 'Thêm voucher' : 'Sửa voucher'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Mã voucher *</label>
                    <input className="form-control form-control-sm text-uppercase" value={form.code}
                      onChange={e => setField('code', e.target.value.toUpperCase())}
                      readOnly={modal.mode === 'edit'} required />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Tên voucher *</label>
                    <input className="form-control form-control-sm" value={form.name} onChange={e => setField('name', e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Mô tả</label>
                    <textarea className="form-control form-control-sm" rows={2} value={form.description} onChange={e => setField('description', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Loại giảm giá *</label>
                    <select className="form-select form-select-sm" value={form.discountType} onChange={e => setField('discountType', e.target.value)}>
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (₫)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Giá trị giảm *</label>
                    <div className="input-group input-group-sm">
                      <input type="number" min="0" className="form-control" value={form.discountValue} onChange={e => setField('discountValue', e.target.value)} required />
                      <span className="input-group-text">{form.discountType === 'percentage' ? '%' : '₫'}</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Giới hạn lượt dùng</label>
                    <input type="number" min="1" className="form-control form-control-sm" placeholder="Không giới hạn" value={form.usageLimit}
                      onChange={e => setField('usageLimit', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Bắt đầu</label>
                    <input type="date" className="form-control form-control-sm" value={form.startDate} onChange={e => setField('startDate', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Kết thúc</label>
                    <input type="date" className="form-control form-control-sm" value={form.endDate} onChange={e => setField('endDate', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Áp dụng cho</label>
                    <select className="form-select form-select-sm" value={form.applyTo} onChange={e => setField('applyTo', e.target.value)}>
                      <option value="all">Tất cả sản phẩm</option>
                      <option value="categories">Danh mục cụ thể</option>
                      <option value="products">Sản phẩm cụ thể</option>
                    </select>
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id="vActive" checked={form.active} onChange={e => setField('active', e.target.checked)} />
                      <label className="form-check-label small" htmlFor="vActive">Kích hoạt</label>
                    </div>
                  </div>

                  {form.applyTo === 'categories' && (
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Chọn danh mục</label>
                      <div className="border rounded p-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                        {categories.map(c => (
                          <div key={c._id} className="form-check">
                            <input className="form-check-input" type="checkbox" id={`cat-${c._id}`}
                              checked={form.categories.includes(c.name)}
                              onChange={() => toggleCategory(c.name)} />
                            <label className="form-check-label small" htmlFor={`cat-${c._id}`}>{c.icon} {c.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.applyTo === 'products' && (
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Chọn sản phẩm</label>
                      <input className="form-control form-control-sm mb-2" placeholder="Tìm sản phẩm…"
                        value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                      <div className="border rounded p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {products.map(p => (
                          <div key={p._id} className="form-check">
                            <input className="form-check-input" type="checkbox" id={`p-${p._id}`}
                              checked={form.products.includes(p.productCode)}
                              onChange={() => toggleProduct(p.productCode)} />
                            <label className="form-check-label small" htmlFor={`p-${p._id}`}>
                              <span className="text-muted me-1">[{p.productCode}]</span>{p.name}
                            </label>
                          </div>
                        ))}
                        {products.length === 0 && <p className="text-muted small mb-0">Không tìm thấy sản phẩm</p>}
                      </div>
                      {form.products.length > 0 && (
                        <div className="mt-2 text-muted small">Đã chọn: {form.products.length} sản phẩm</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setModal(null)}>Hủy</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || !form.code || !form.name || !form.discountValue}>
                  {saving ? 'Đang lưu…' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: 36 }}>🎟️</div>
                <p className="mb-1 fw-semibold mt-2">Xóa voucher?</p>
                <p className="text-muted small mb-0">{deleteTarget.code} — {deleteTarget.name}</p>
              </div>
              <div className="modal-footer justify-content-center border-0 pt-0">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setDeleteTarget(null)}>Hủy</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleteMutation.isPending}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
