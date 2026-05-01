import React from 'react';
import storeConfig from '../../config/store';
import { FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

const Showrooms = () => {
  const { showrooms } = storeConfig;

  return (
    <section className="bg-light py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="h4 font-weight-bold">Hệ Thống Showroom</h2>
          <p className="text-muted">Ghé thăm chúng tôi để trải nghiệm sản phẩm trực tiếp</p>
        </div>

        <div className="row g-4">
          {showrooms.map((room, i) => (
            <div key={i} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm showroom-card">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3" style={{ color: 'var(--color-primary)' }}>
                    📍 {room.name}
                  </h5>

                  <div className="d-flex gap-2 mb-2 small">
                    <FaMapMarkerAlt className="text-danger flex-shrink-0 mt-1" />
                    <span className="text-muted">{room.address}</span>
                  </div>

                  <div className="d-flex gap-2 mb-2 small">
                    <FaPhone className="text-danger flex-shrink-0 mt-1" />
                    <a href={`tel:${room.phone.replace(/\s/g, '')}`} className="text-muted text-decoration-none">
                      {room.phone}
                    </a>
                  </div>

                  <div className="d-flex gap-2 mb-3 small">
                    <FaClock className="text-danger flex-shrink-0 mt-1" />
                    <span className="text-muted">{room.hours}</span>
                  </div>

                  <a
                    href={room.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-danger btn-sm"
                  >
                    Xem bản đồ →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showrooms;
