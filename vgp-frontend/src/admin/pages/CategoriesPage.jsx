import { useState } from 'react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useSeedCategories,
} from '../hooks/useAdminCategories';

const emptyForm = { name: '', slug: '', icon: '', order: 0, isActive: true, subcategories: [] };

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

export default function CategoriesPage() {
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data: {} }
  const [form, setForm] = useState(emptyForm);
  const [newSub, setNewSub] = useState({ name: '', slug: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const { data, isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const seedMutation = useSeedCategories();

  const categories = data?.data || [];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => { setForm(emptyForm); setModal({ mode: 'create' }); };
  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', order: cat.order ?? 0, isActive: cat.isActive ?? true, subcategories: cat.subcategories || [] });
    setModal({ mode: 'edit', id: cat._id });
  };

  const setField = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (k === 'name') next.slug = toSlug(v);
    return next;
  });

  const addSub = () => {
    if (!newSub.name.trim()) return;
    setForm(f => ({ ...f, subcategories: [...f.subcategories, { name: newSub.name.trim(), slug: newSub.slug || toSlug(newSub.name) }] }));
    setNewSub({ name: '', slug: '' });
  };

  const removeSub = (i) => setForm(f => ({ ...f, subcategories: f.subcategories.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    try {
      if (modal.mode === 'create') {
        await createMutation.mutateAsync(form);
        showToast('Đã tạo danh mục');
      } else {
        await updateMutation.mutateAsync({ id: modal.id, data: form });
        showToast('Đã cập nhật danh mục');
      }
      setModal(null);
    } catch (e) {
      showToast(e?.error || 'Lỗi lưu danh mục', 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      showToast('Đã xóa danh mục');
    } catch (e) {
      showToast(e?.error || 'Lỗi xóa', 'danger');
    }
    setDeleteTarget(null);
  };

  const handleSeed = async () => {
    try {
      const res = await seedMutation.mutateAsync();
      showToast(res.message);
    } catch (e) {
      showToast(e?.error || 'Lỗi seed', 'danger');
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 20, right: 20, zIndex: 9999, minWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Danh mục</h4>
          <small className="text-muted">{categories.length} danh mục</small>
        </div>
        <div className="d-flex gap-2">
          {categories.length === 0 && (
            <button className="btn btn-outline-secondary btn-sm" onClick={handleSeed} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? 'Đang seed…' : '🌱 Seed dữ liệu mặc định'}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm danh mục</button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr>
                <th>Tên</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Thứ tự</th>
                <th>Danh mục con</th>
                <th className="text-center">Hiển thị</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Đang tải…</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-muted">Chưa có danh mục. Nhấn "Seed dữ liệu mặc định" để thêm nhanh.</td></tr>
              ) : categories.map(c => (
                <tr key={c._id}>
                  <td className="fw-semibold">{c.name}</td>
                  <td className="text-muted font-monospace" style={{ fontSize: 12 }}>{c.slug}</td>
                  <td>{c.icon}</td>
                  <td>{c.order}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {(c.subcategories || []).map(s => (
                        <span key={s.slug} className="badge bg-light text-secondary border">{s.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>{c.isActive ? 'Có' : 'Ẩn'}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-link btn-sm p-0 me-2" onClick={() => openEdit(c)}>Sửa</button>
                    <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => setDeleteTarget(c)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal.mode === 'create' ? 'Thêm danh mục' : 'Sửa danh mục'}</h5>
                <button className="btn-close" onClick={() => setModal(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Tên danh mục *</label>
                    <input className="form-control form-control-sm" value={form.name} onChange={e => setField('name', e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Slug</label>
                    <input className="form-control form-control-sm font-monospace" value={form.slug} onChange={e => setField('slug', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Icon (emoji)</label>
                    <input className="form-control form-control-sm" value={form.icon} onChange={e => setField('icon', e.target.value)} placeholder="🚿" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Thứ tự</label>
                    <input type="number" className="form-control form-control-sm" value={form.order} onChange={e => setField('order', Number(e.target.value))} />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id="isActive" checked={form.isActive} onChange={e => setField('isActive', e.target.checked)} />
                      <label className="form-check-label small" htmlFor="isActive">Hiển thị</label>
                    </div>
                  </div>
                </div>

                <hr />
                <div className="fw-semibold mb-2" style={{ fontSize: 13 }}>Danh mục con</div>
                {form.subcategories.map((s, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
                    <input className="form-control form-control-sm flex-fill" value={s.name}
                      onChange={e => {
                        const subs = [...form.subcategories];
                        subs[i] = { ...subs[i], name: e.target.value };
                        setForm(f => ({ ...f, subcategories: subs }));
                      }}
                    />
                    <input className="form-control form-control-sm font-monospace" style={{ width: 180 }} value={s.slug}
                      onChange={e => {
                        const subs = [...form.subcategories];
                        subs[i] = { ...subs[i], slug: e.target.value };
                        setForm(f => ({ ...f, subcategories: subs }));
                      }}
                    />
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeSub(i)}>✕</button>
                  </div>
                ))}
                <div className="d-flex gap-2 mt-2">
                  <input className="form-control form-control-sm flex-fill" placeholder="Tên danh mục con" value={newSub.name}
                    onChange={e => setNewSub(s => ({ ...s, name: e.target.value, slug: toSlug(e.target.value) }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSub())}
                  />
                  <input className="form-control form-control-sm font-monospace" style={{ width: 160 }} placeholder="slug" value={newSub.slug}
                    onChange={e => setNewSub(s => ({ ...s, slug: e.target.value }))}
                  />
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={addSub}>+ Thêm</button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setModal(null)}>Hủy</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
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
                <div style={{ fontSize: 36 }}>🗂️</div>
                <p className="mb-1 fw-semibold mt-2">Xóa danh mục?</p>
                <p className="text-muted small mb-0">{deleteTarget.name}</p>
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
