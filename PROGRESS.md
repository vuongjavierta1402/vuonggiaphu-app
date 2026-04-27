# PROGRESS.md — VƯƠNG GIA PHÚ (vpg-app)

Tracks every completed, in-progress, and planned task for the vpg-app project.
Updated: 2026-04-12.

---

## Legend
- ✅ Done
- 🔄 In progress
- ⬜ Planned / not started

---

## Session 1 — Initial build (interrupted)

| # | Task | Status |
|---|------|--------|
| 1 | Scaffold `vgp-backend` — Express server on port 3001, MongoDB via Mongoose | ✅ |
| 2 | Backend middleware — `asyncWrapper`, `errorHandler` (JSON errors), `notFound` | ✅ |
| 3 | Mongoose models — `Product`, `Order`, `PromoCode` with indexes | ✅ |
| 4 | Service layer — `productService.js` (all DB queries, full-text search) | ✅ |
| 5 | REST controllers — `productController`, `categoryController`, `orderController`, `promoController` | ✅ |
| 6 | Express routes — `/products`, `/categories`, `/orders`, `/promos` under `/api/v1` | ✅ |
| 7 | Seed script — `scripts/seed.js` (batch-import products + promo codes) | ✅ |
| 8 | Scaffold `vgp-frontend` — React 19, Redux Toolkit, React Query, Bootstrap 5 | ✅ |
| 9 | API client — Axios instance with `{ success, data }` envelope unwrap + error interceptor | ✅ |
| 10 | Redux store — `cartSlice`, `wishlistSlice`, `uiSlice`, `promoSlice`, `currencySlice` | ✅ |
| 11 | React Query hooks — `useProducts`, `useProduct`, `useFeaturedProducts`, `useSaleProducts`, `useSimilarProducts`, `useCategories`, `useBrands` | ✅ |
| 12 | Pages — `HomePage`, `AllProductsPage`, `ProductCategoriesPage`, `ProductDetailsPage`, `SalesPage`, `CartPage`, `CheckoutPage` | ✅ |
| 13 | Components — `ProductCard`, `ProductsDisplay`, `ProductFilter`, `Ratings`, `ShopFeatures`, `MainMenu`, `Footer`, `Loader`, `Modal`, `Alert` | ✅ |
| 14 | Layout — `MainLayout` (sticky header, search, cart badge, mobile hamburger) | ✅ |
| 15 | Utils — `formatVND`, `discountPercent`, `validateCheckoutForm`, `constants.js` | ✅ |

---

## Session 2 — Structure, docs, audit & completion (2026-04-12)

### Repository restructure

| # | Task | Status |
|---|------|--------|
| 16 | Move `vgp-backend` + `vgp-frontend` into new root folder `vpg-app/` | ✅ |

### Documentation

| # | Task | Status |
|---|------|--------|
| 17 | Create `CLAUDE.md` — AI coding instructions, architecture diagram, conventions, env vars | ✅ |
| 18 | Create `PRD.md` — full product requirements (features, API, data models, NFRs, out-of-scope) | ✅ |
| 19 | Create `README.md` — developer setup, architecture, API reference, page routes, tech stack | ✅ |
| 20 | Create `PROGRESS.md` — this file | ✅ |

### Config system (theme + store)

| # | Task | Status |
|---|------|--------|
| 21 | `src/config/theme.js` — color palette (primary, dark, hover, light, secondary, accent) | ✅ |
| 22 | `src/config/store.js` — all business content (name, hotlines, showrooms, banners, brands, footer) | ✅ |
| 23 | `src/index.js` — inject theme as CSS custom properties on `<html>` at startup | ✅ |
| 24 | `src/App.css` — replace all hardcoded hex colors with `var(--color-*)` | ✅ |

### Bug fixes

| # | Bug | Fix | Status |
|---|-----|-----|--------|
| 25 | `orderController.js` — promo `usageCount` never incremented on order create | Added `PromoCode.findOneAndUpdate($inc usageCount)` after `Order.create()` | ✅ |
| 26 | `cartSlice.js` — `updateQuantity` had no `MAX_CART` cap (could exceed 10) | Clamp to `Math.min(MAX_CART, Math.max(1, quantity))` in both `addToCart` and `updateQuantity` | ✅ |
| 27 | `CheckoutPage.jsx` — order number not captured from API response | Read `result?.data?.orderNumber`, dispatch `setOrderSuccess({ success, orderNumber })` | ✅ |
| 28 | `cartSlice.js` — `orderSuccess` stored only boolean, no order number | Added `orderNumber` field to initial state; `setOrderSuccess` now accepts `{ success, orderNumber }` | ✅ |
| 29 | `CartPage.jsx` — success screen showed no order number or tracking link | Now displays `orderNumber` and links to `/order/:orderNumber` | ✅ |

### New shared components

| # | Component | Description | Status |
|---|-----------|-------------|--------|
| 30 | `components/Pagination/index.jsx` | Ellipsis pagination, replaces 3 duplicate inline copies | ✅ |
| 31 | `components/ErrorBoundary/index.jsx` | Class component; catches render crashes, shows recovery UI + stack trace in dev | ✅ |
| 32 | `components/HeroBanner/index.jsx` | Auto-sliding carousel (5 s, pause on hover), prev/next arrows, dot indicators, driven by `storeConfig.heroBanners` | ✅ |
| 33 | `components/BrandShowcase/index.jsx` | Brand card grid with hover effects, driven by `storeConfig.brands` | ✅ |
| 34 | `components/Showrooms/index.jsx` | Showroom cards (address, phone, hours, map link), driven by `storeConfig.showrooms` | ✅ |

### New pages

| # | Route | Page | Status |
|---|-------|------|--------|
| 35 | `/wishlist` | `WishlistPage.jsx` — view/manage saved products, add to cart or remove | ✅ |
| 36 | `/order/:orderNumber` | `OrderTrackingPage.jsx` — step progress bar, customer info, items, totals | ✅ |

### Layout & navigation improvements

| # | Task | Status |
|---|------|--------|
| 37 | `MainLayout.jsx` — top bar with hotlines + working hours (desktop only) | ✅ |
| 38 | `MainLayout.jsx` — Wishlist icon with badge in header | ✅ |
| 39 | `MainLayout.jsx` — mobile sidebar drawer with full navigation (categories, subcategories, sale, wishlist, cart, hotlines) | ✅ |
| 40 | `MainMenu.jsx` — Brands dropdown driven by `storeConfig.brands` | ✅ |
| 41 | `MainMenu.jsx` — Category dropdowns now include "Tất cả {category}" header link | ✅ |
| 42 | `Footer/index.jsx` — rebuilt as 4-column footer with social icons (FB/YT/IG/TikTok), services column, policies column, features column | ✅ |
| 43 | `ShopFeatures/index.jsx` — driven by `storeConfig.features` | ✅ |

### Page updates

| # | Task | Status |
|---|------|--------|
| 44 | `HomePage.jsx` — replaced static hero with `HeroBanner` carousel | ✅ |
| 45 | `HomePage.jsx` — added `BrandShowcase` section | ✅ |
| 46 | `HomePage.jsx` — added `Showrooms` section | ✅ |
| 47 | `AllProductsPage.jsx` — replaced inline Pagination with shared component | ✅ |
| 48 | `SalesPage.jsx` — replaced inline Pagination with shared component | ✅ |
| 49 | `ProductCategoriesPage.jsx` — replaced inline Pagination with shared component | ✅ |

### App wiring

| # | Task | Status |
|---|------|--------|
| 50 | `App.js` — added routes for `/wishlist` and `/order/:orderNumber` | ✅ |
| 51 | `index.js` — wrapped `<App>` with `<ErrorBoundary>` | ✅ |
| 52 | `vgp-frontend/.env.example` — created template for new developers | ✅ |

---

## Planned — Session 3+

### Admin dashboard (out of scope for v1 per PRD)
| # | Task | Status |
|---|------|--------|
| P1 | Admin login / auth (JWT) | ⬜ |
| P2 | Product management — create, edit, delete, upload images | ⬜ |
| P3 | Order management — list, filter by status, update status | ⬜ |
| P4 | Promo code management — create, activate/deactivate | ⬜ |

### Features
| # | Task | Status |
|---|------|--------|
| F1 | Email order confirmation (Nodemailer or third-party) | ⬜ |
| F2 | Search autocomplete / suggestions dropdown | ⬜ |
| F3 | Product image upload & CDN serving (Cloudinary or S3) | ⬜ |
| F4 | Cart / wishlist persistence (localStorage or user account) | ⬜ |
| F5 | User accounts — register, login, order history | ⬜ |
| F6 | Payment gateway (MoMo, VNPay, or Stripe) | ⬜ |
| F7 | Product reviews — submit rating + comment | ⬜ |
| F8 | SEO — `<title>`, `<meta description>`, Open Graph per page | ⬜ |
| F9 | Zalo / Facebook Messenger live chat widget | ⬜ |

### Infrastructure
| # | Task | Status |
|---|------|--------|
| I1 | Production build & deploy (Vercel for frontend, Railway/Render for backend) | ⬜ |
| I2 | Environment-specific CORS configuration | ⬜ |
| I3 | Rate limiting on API (express-rate-limit) | ⬜ |
| I4 | Image optimisation pipeline (WebP conversion, lazy loading with dimensions) | ⬜ |

---

## File tree (current)

```
vpg-app/
├── CLAUDE.md
├── PRD.md
├── README.md
├── PROGRESS.md
│
├── vgp-backend/
│   ├── .env.example
│   ├── package.json
│   ├── scripts/seed.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/db.js
│       ├── controllers/
│       │   ├── categoryController.js
│       │   ├── orderController.js       ← bug fix: promo usageCount
│       │   ├── productController.js
│       │   └── promoController.js
│       ├── middleware/
│       │   ├── asyncWrapper.js
│       │   ├── errorHandler.js
│       │   └── notFound.js
│       ├── models/
│       │   ├── Order.js
│       │   ├── Product.js
│       │   └── PromoCode.js
│       ├── routes/
│       │   ├── categoryRoutes.js
│       │   ├── index.js
│       │   ├── orderRoutes.js
│       │   ├── productRoutes.js
│       │   └── promoRoutes.js
│       └── services/productService.js
│
└── vgp-frontend/
    ├── .env.example                     ← new
    ├── package.json
    └── src/
        ├── App.css                      ← CSS vars, new component styles
        ├── App.js                       ← /wishlist + /order/:orderNumber routes
        ├── index.js                     ← theme injection + ErrorBoundary
        ├── config/
        │   ├── store.js                 ← new: all business content
        │   └── theme.js                 ← new: color palette
        ├── api/
        │   ├── client.js
        │   ├── orderApi.js
        │   └── productApi.js
        ├── components/
        │   ├── BrandShowcase/           ← new
        │   ├── ErrorBoundary/           ← new
        │   ├── Footer/                  ← rebuilt: 4-col, social links
        │   ├── HeroBanner/              ← new: auto-sliding carousel
        │   ├── Menus/MainMenu.jsx       ← brands dropdown added
        │   ├── Pagination/              ← new: shared component
        │   ├── ProductCard/
        │   ├── ProductFilter/
        │   ├── ProductsDisplay/
        │   ├── Ratings/
        │   ├── ShopFeatures/            ← driven by storeConfig
        │   ├── Showrooms/               ← new
        │   └── UI/ (Alert, Loader, Modal)
        ├── hooks/useProducts.js
        ├── layouts/MainLayout.jsx       ← top bar, sidebar nav, wishlist icon
        ├── pages/
        │   ├── AllProductsPage.jsx      ← shared Pagination
        │   ├── CartPage.jsx             ← order number + tracking link
        │   ├── CheckoutPage.jsx         ← captures orderNumber
        │   ├── HomePage.jsx             ← carousel, brands, showrooms
        │   ├── OrderTrackingPage.jsx    ← new
        │   ├── ProductCategoriesPage.jsx← shared Pagination
        │   ├── ProductDetailsPage.jsx
        │   ├── SalesPage.jsx            ← shared Pagination
        │   └── WishlistPage.jsx         ← new
        ├── store/
        │   ├── store.js
        │   └── slices/
        │       ├── cartSlice.js         ← MAX_CART fix, orderNumber
        │       ├── currencySlice.js
        │       ├── promoSlice.js
        │       ├── uiSlice.js
        │       └── wishlistSlice.js
        └── utils/
            ├── constants.js
            ├── currency.js
            └── formValidation.js
```
