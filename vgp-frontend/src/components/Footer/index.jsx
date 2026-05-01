import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import storeConfig from '../../config/store';

const Footer = () => {
  const { name, description, hotlines, email, workingHours, social, footerLinks, footerPolicies, footerServices } = storeConfig;

  return (
    <footer className="footer bg-dark text-light pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">

          {/* Col 1 — Brand & contact */}
          <div className="col-md-3 mb-4">
            <h5 className="text-white font-weight-bold mb-1">{name}</h5>
            <p className="small" style={{ color: 'var(--color-primary)' }}>Thiết Bị Vệ Sinh & Nội Thất Cao Cấp</p>
            <p className="small text-secondary mb-3">{description}</p>

            {hotlines.map((h) => (
              <div key={h} className="d-flex align-items-center gap-2 mb-1">
                <FaPhone size={12} className="text-danger" />
                <a href={`tel:${h.replace(/\s/g, '')}`} className="small text-light text-decoration-none">{h}</a>
              </div>
            ))}
            <div className="d-flex align-items-center gap-2 mb-1">
              <FaEnvelope size={12} className="text-danger" />
              <a href={`mailto:${email}`} className="small text-light text-decoration-none">{email}</a>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaClock size={12} className="text-danger" />
              <span className="small text-secondary">{workingHours}</span>
            </div>

            {/* Social icons */}
            <div className="d-flex gap-3 flex-wrap">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-secondary footer-social">
                  <FaFacebook size={20} />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-secondary footer-social">
                  <FaYoutube size={20} />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary footer-social">
                  <FaInstagram size={20} />
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-secondary footer-social">
                  <FaTiktok size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2 — Danh mục */}
          <div className="col-md-3 mb-4">
            <h6 className="text-white font-weight-bold mb-3">Danh Mục Sản Phẩm</h6>
            <ul className="list-unstyled small">
              {footerLinks.map((l) => (
                <li key={l.href} className="mb-1">
                  <Link to={l.href} className="text-secondary text-decoration-none footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Dịch vụ & chính sách */}
          <div className="col-md-3 mb-4">
            <h6 className="text-white font-weight-bold mb-3">Dịch Vụ</h6>
            <ul className="list-unstyled small mb-4">
              {footerServices.map((s) => (
                <li key={s} className="mb-1 text-secondary">{s}</li>
              ))}
            </ul>
            <h6 className="text-white font-weight-bold mb-3">Chính Sách</h6>
            <ul className="list-unstyled small">
              {footerPolicies.map((p) => (
                <li key={p} className="mb-1 text-secondary">{p}</li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Cam kết */}
          <div className="col-md-3 mb-4">
            <h6 className="text-white font-weight-bold mb-3">Cam Kết Với Khách Hàng</h6>
            <div className="small text-secondary">
              {storeConfig.features.map((f) => (
                <div key={f.title} className="d-flex align-items-start mb-3">
                  <span className="mr-2 flex-shrink-0" style={{ fontSize: 20 }}>{f.icon}</span>
                  <div>
                    <div className="font-weight-bold text-light" style={{ fontSize: '0.8rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.75rem' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <hr className="border-secondary" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <span>© {new Date().getFullYear()} {name}. Bảo lưu mọi quyền.</span>
          <span className="mt-2 mt-md-0">Thiết kế bởi <strong className="text-danger">VGP</strong></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
