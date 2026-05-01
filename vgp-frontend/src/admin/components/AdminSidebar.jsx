import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/admin/products',   icon: '📦', label: 'Sản phẩm' },
  { to: '/admin/categories', icon: '🗂️',  label: 'Danh mục' },
  { to: '/admin/vouchers',   icon: '🎟️',  label: 'Voucher' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div style={{ width: 220, minHeight: '100vh', background: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>VGP Admin</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Vương Gia Phú</div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0' }}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              color: isActive ? '#f1f5f9' : '#94a3b8',
              background: isActive ? '#334155' : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            })}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
        <button
          onClick={logout}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, padding: 0 }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}
