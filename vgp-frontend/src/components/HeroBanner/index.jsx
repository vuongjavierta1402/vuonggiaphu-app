import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import storeConfig from '../../config/store';

const { heroBanners } = storeConfig;

const HeroBanner = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % heroBanners.length);
  }, []);

  const prev = () => {
    setActive((a) => (a - 1 + heroBanners.length) % heroBanners.length);
  };

  useEffect(() => {
    if (heroBanners.length <= 1 || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, paused]);

  return (
    <div
      className="hero-banner position-relative overflow-hidden"
      style={{ minHeight: 380 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {heroBanners.map((banner, i) => (
        <div
          key={i}
          className="hero-banner__slide position-absolute w-100 d-flex align-items-center justify-content-center text-white text-center"
          style={{
            background: banner.bg || 'var(--color-primary)',
            top: 0, left: 0, bottom: 0,
            opacity:    i === active ? 1 : 0,
            zIndex:     i === active ? 1 : 0,
            transition: 'opacity 0.7s ease',
            minHeight:  380,
          }}
        >
          <div className="container py-5">
            {banner.tag && (
              <span
                className="badge px-3 py-2 mb-3 d-inline-block"
                style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', borderRadius: 20 }}
              >
                {banner.tag}
              </span>
            )}
            <h1 className="display-4 font-weight-bold mb-3">{banner.title}</h1>
            <p className="lead mb-4 mx-auto" style={{ maxWidth: 600, opacity: 0.9 }}>
              {banner.subtitle}
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              {(banner.links || []).map((l, j) => (
                <Link
                  key={j}
                  to={l.href}
                  className={j === 0
                    ? 'btn btn-light btn-lg font-weight-bold px-4'
                    : 'btn btn-outline-light btn-lg px-4'}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      {heroBanners.length > 1 && (
        <>
          <button
            className="hero-banner__arrow hero-banner__arrow--prev"
            onClick={prev}
            aria-label="Slide trước"
          >
            ‹
          </button>
          <button
            className="hero-banner__arrow hero-banner__arrow--next"
            onClick={next}
            aria-label="Slide tiếp"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="hero-banner__dots">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                className={`hero-banner__dot ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
