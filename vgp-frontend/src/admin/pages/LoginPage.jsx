import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminClient from '../api/adminClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminClient.post('/login', form);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/products');
    } catch (err) {
      setError(err?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
          <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>VGP Admin</h4>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Vương Gia Phú — Quản trị</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>
        )}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@vgp.com"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
