import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useUploadImages,
  useProductVouchers,
  useSyncProductVouchers,
} from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';
import { useAdminVouchers } from '../hooks/useAdminVouchers';

const BRANDS = ['TOTO', 'INAX', 'VIGLACERA', 'AMERICAN STANDARD', 
  'ATTAX', 'HAPHAKO', 'JOMOO', 'Caesar', "PANASONIC", "HAFELE",
   "MALLORCA", "GROHE", "FERROLI", "ARISTON", "BOSCH", "SIEMENS", 
   "ELECTROLUX", "WHIRLPOOL", "LG", "SAMSUNG", "GARIS", "THIÊN THANH", "HC"];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const empty = {
  productCode: '', name: '', price: '', discountPrice: '',
  brand: '', category: '', subcategory: '', quantity: 0,
  isDisplay: true, sale: false, highlighted: false,
  description: '', images: [],
};

export default function ProductEditPage() {
  const { code } = useParams();
  const isNew = code === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [toast, setToast] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState([]);

  const { data: productData, isLoading } = useAdminProduct(isNew ? null : code);
  const { data: catData } = useAdminCategories();
  const { data: allVouchersData } = useAdminVouchers({ limit: 200 });
  const { data: productVouchersData } = useProductVouchers(isNew ? null : code);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(code);
  const uploadMutation = useUploadImages();
  const syncVouchersMutation = useSyncProductVouchers(code);

  const categories = catData?.data || [];
  const allVouchers = allVouchersData?.data || [];
  const selectedCat = categories.find(c => c.name === form.category);

  useEffect(() => {
    if (!isNew && productData?.data) {
      const p = productData.data;
      setForm({
        productCode: p.productCode || '',
        name:          p.name || '',
        price:         p.price ?? '',
        discountPrice: p.discountPrice ?? '',
        brand:         p.brand || '',
        category:      p.category || '',
        subcategory:   p.subcategory || '',
        quantity:      p.quantity ?? 0,
        isDisplay:     p.isDisplay ?? true,
        sale:          p.sale ?? false,
        highlighted:   p.highlighted ?? false,
        description:   p.description || '',
        images:        p.images || [],
      });
    }
  }, [productData, isNew]);

  useEffect(() => {
    if (productVouchersData?.data) {
      setSelectedVoucherIds(productVouchersData.data.filter(v => v.explicit).map(v => v._id));
    }
  }, [productVouchersData]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const res = await uploadMutation.mutateAsync(files);
      set('images', [...form.images, ...res.data]);
    } catch (err) {
      showToast(err?.error || 'Lỗi tải ảnh lên', 'danger');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const moveImage = (idx, dir) => {
    const imgs = [...form.images];
    const target = idx + dir;
    if (target < 0 || target >= imgs.length) return;
    [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
    set('images', imgs);
  };

  const toggleVoucher = (id) =>
    setSelectedVoucherIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price:         Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      quantity:      Number(form.quantity) || 0,
    };

    try {
      if (isNew) {
        await createMutation.mutateAsync(payload);
        showToast('Đã tạo sản phẩm');
        navigate('/admin/products');
      } else {
        await updateMutation.mutateAsync(payload);
        await syncVouchersMutation.mutateAsync(selectedVoucherIds);
        showToast('Đã lưu thay đổi');
        if (payload.productCode !== code) {
          navigate(`/admin/products/${payload.productCode}`, { replace: true });
        }
      }
    } catch (err) {
      showToast(err?.error || 'Lỗi lưu sản phẩm', 'danger');
    }
  };

  if (!isNew && isLoading) {
    return <div className="text-center py-5 text-muted">Đang tải…</div>;
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 20, right: 20, zIndex: 9999, minWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-3" style={{ fontSize: 13 }}>
        <Link to="/admin/products" className="text-decoration-none text-muted">Sản phẩm</Link>
        <span className="text-muted mx-1">/</span>
        <span className="text-dark">{isNew ? 'Thêm mới' : form.productCode}</span>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0 fw-bold">{isNew ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}</h4>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/products')}>Hủy</button>
          <button type="submit" form="product-form" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left column */}
          <div className="col-lg-8">

            {/* Basic info */}
            <div className="card mb-4">
              <div className="card-header fw-semibold" style={{ fontSize: 13 }}>Thông tin cơ bản</div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Mã sản phẩm *</label>
                    <input
                      className="form-control form-control-sm"
                      value={form.productCode}
                      onChange={e => set('productCode', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Tên sản phẩm *</label>
                    <input
                      className="form-control form-control-sm"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Thương hiệu</label>
                    <select className="form-select form-select-sm" value={form.brand} onChange={e => set('brand', e.target.value)}>
                      <option value="">— Chọn thương hiệu —</option>
                      {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Danh mục</label>
                    <select className="form-select form-select-sm" value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }}>
                      <option value="">— Chọn danh mục —</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Danh mục con</label>
                    <select className="form-select form-select-sm" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} disabled={!selectedCat}>
                      <option value="">— Chọn danh mục con —</option>
                      {(selectedCat?.subcategories || []).map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Giá *</label>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={e => set('price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Giá sale</label>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      min="0"
                      value={form.discountPrice}
                      onChange={e => set('discountPrice', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Số lượng</label>
                    <input
                      className="form-control form-control-sm"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={e => set('quantity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="card mb-4">
              <div className="card-body d-flex gap-4">
                {[['isDisplay', 'Hiển thị'], ['sale', 'Đang sale'], ['highlighted', 'Nổi bật']].map(([key, label]) => (
                  <div key={key} className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={key}
                      checked={!!form[key]}
                      onChange={e => set(key, e.target.checked)}
                    />
                    <label className="form-check-label small" htmlFor={key}>{label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card mb-4">
              <div className="card-header fw-semibold" style={{ fontSize: 13 }}>Mô tả sản phẩm</div>
              <div className="card-body p-0">
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={val => set('description', val)}
                  modules={QUILL_MODULES}
                  style={{ minHeight: 220 }}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-lg-4">
            {/* Images */}
            <div className="card mb-4">
              <div className="card-header fw-semibold d-flex align-items-center justify-content-between" style={{ fontSize: 13 }}>
                <span>Hình ảnh ({form.images.length})</span>
                <label className="btn btn-outline-primary btn-sm mb-0" style={{ cursor: 'pointer' }}>
                  {uploadingImages ? 'Đang tải…' : '+ Tải ảnh lên'}
                  <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} disabled={uploadingImages} />
                </label>
              </div>
              <div className="card-body">
                {form.images.length === 0 ? (
                  <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>Chưa có ảnh</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {form.images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 90, height: 90 }}>
                        <img
                          src={url}
                          alt=""
                          style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }}
                          onError={e => { e.target.src = '/images/placeholder.jpg'; }}
                        />
                        {i === 0 && (
                          <span style={{ position: 'absolute', top: 2, left: 2, background: '#3b82f6', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 3 }}>CHÍNH</span>
                        )}
                        <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {i > 0 && (
                            <button type="button" onClick={() => moveImage(i, -1)} style={{ width: 18, height: 18, fontSize: 9, padding: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>↑</button>
                          )}
                          {i < form.images.length - 1 && (
                            <button type="button" onClick={() => moveImage(i, 1)} style={{ width: 18, height: 18, fontSize: 9, padding: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>↓</button>
                          )}
                          <button type="button" onClick={() => removeImage(i)} style={{ width: 18, height: 18, fontSize: 11, padding: 0, background: 'rgba(220,38,38,0.8)', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vouchers */}
            {!isNew && (
              <div className="card">
                <div className="card-header fw-semibold" style={{ fontSize: 13 }}>Voucher áp dụng</div>
                <div className="card-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {!productVouchersData?.data?.length ? (
                    <p className="text-muted small mb-0">Chưa có voucher nào</p>
                  ) : productVouchersData.data.map(v => {
                    const discountLabel = v.discountType === 'percentage'
                      ? `${v.discountValue}%`
                      : `${v.discountValue.toLocaleString('vi-VN')}₫`;
                    const isChecked = selectedVoucherIds.includes(v._id);
                    return (
                      <div key={v._id} className="d-flex align-items-start gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <input
                          className="form-check-input mt-1 flex-shrink-0"
                          type="checkbox"
                          id={`v-${v._id}`}
                          checked={isChecked}
                          onChange={() => toggleVoucher(v._id)}
                        />
                        <label className="form-check-label small w-100" htmlFor={`v-${v._id}`} style={{ cursor: 'pointer' }}>
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            <span className="fw-semibold">{v.code}</span>
                            <span className="text-muted">— {discountLabel}</span>
                            {v.autoApplied && (
                              <span className="badge text-bg-success" style={{ fontSize: 10 }}>Tự động</span>
                            )}
                            {isChecked && !v.autoApplied && (
                              <span className="badge text-bg-primary" style={{ fontSize: 10 }}>Chỉ định</span>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>{v.name}</div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
