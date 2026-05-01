# CLAUDE.md — VƯƠNG GIA PHÚ (vpg-app)

This file gives Claude Code the context it needs to work effectively in this monorepo.

---

## Project overview

**vpg-app** is a Vietnamese e-commerce storefront for *Vương Gia Phú*, a retailer specialising in high-end sanitary fixtures and furniture. The repository contains two packages:

| Folder          | Tech stack                                         | Port |
|-----------------|----------------------------------------------------|------|
| `vgp-backend`   | Node.js · Express · Mongoose · MongoDB Atlas       | 3001 |
| `vgp-frontend`  | React 19 · Redux Toolkit · React Query · Bootstrap | 3000 |

---

## Running locally

### Backend
```bash
cd vgp-backend
cp .env.example .env        # fill in MONGODB_URI and CORS_ORIGIN
npm install
npm run dev                 # nodemon hot-reload
```

### Frontend
```bash
cd vgp-frontend
npm install
npm start                   # CRA dev server
```

The frontend proxies API calls to `http://localhost:3001` via the `REACT_APP_API_URL` env var (see `src/api/client.js`).

---

## Architecture & data flow

```
MongoDB Atlas
    │
    ▼
Mongoose models (src/models/)
    │  Product · Order · PromoCode · Category · Voucher
    ▼
Service layer (src/services/)
    │  productService.js · adminProductService.js
    │  All DB queries live here — controllers stay thin
    ▼
Controllers (src/controllers/)
    │  Parse req, call service, shape res.json()
    ▼
Express router  /api/v1/
    │  /products  /categories  /orders  /promos
    │  /admin/*  (JWT-protected)
    ▼
React Query hooks
    │  src/hooks/useProducts.js          (storefront)
    │  src/admin/hooks/useAdminProducts.js etc.  (admin)
    ▼
Page components
    │  Storefront: src/pages/
    │  Admin:      src/admin/pages/
    ▼
Redux store (client-only state)
    │  cart · wishlist · promo · ui · currency
    ▼
User's browser
```

---

## Coding conventions

### Backend
- **All routes return JSON** — never HTML. Exception: `GET /admin/products/export` streams an Excel file.
- Controllers must stay thin. Put all query logic in `src/services/`.
- Wrap async controllers with `asyncWrapper` middleware so unhandled promise rejections are forwarded to `errorHandler`.
- Error shape: `{ success: false, error: "<message>" }` with the correct HTTP status.
- Environment variables are loaded via `dotenv` in `server.js`. Never hard-code secrets.
- Admin routes all require a valid JWT via `authMiddleware`. Register static paths (e.g. `/products/export`, `/products/import`) **before** `:param` routes to avoid conflicts.

### Frontend
- **Server data** → React Query (`useQuery`). Never store API data in Redux.
- **Client-only state** → Redux slices (`cart`, `wishlist`, `promo`, `ui`, `currency`).
- Use `camelCase` for variables/functions, `PascalCase` for components.
- Use `async/await`, not `.then()` chains.
- Vietnamese strings go directly in JSX — no i18n layer.
- Currency formatting: always use `formatVND()` from `src/utils/currency.js`.
- Images: use `imgSrc()` from `src/utils/currency.js` — returns URL as-is if it starts with `http`, otherwise prepends `/images/`. Fall back to `/images/placeholder.jpg` on error.
- Admin area uses a separate Axios instance (`src/admin/api/adminClient.js`) with JWT header injection. Do not use the storefront `apiClient` for admin calls.
- Binary downloads (export Excel) use `responseType: 'blob'` on `adminClient` — the response interceptor returns `res.data` which is a Blob.

---

## Key files to know

### Backend

| Path | Purpose |
|------|---------|
| `src/app.js` | Express app setup (helmet, cors, morgan, routes) |
| `src/models/Product.js` | Mongoose schema + compound indexes |
| `src/models/Category.js` | Dynamic category collection (name, slug, subcategories[]) |
| `src/models/Voucher.js` | Admin voucher model (percentage or fixed discount, applyTo scope) |
| `src/models/PromoCode.js` | Legacy storefront promo codes (percentage only) |
| `src/services/productService.js` | Storefront product queries |
| `src/services/adminProductService.js` | Admin product queries (list, export, import, CRUD) |
| `src/controllers/adminProductController.js` | Admin product handlers incl. image upload, Excel import/export |
| `src/controllers/promoController.js` | Validates codes against PromoCode first, then Voucher collection |
| `src/middleware/authMiddleware.js` | JWT Bearer token verification for admin routes |
| `src/middleware/uploadMiddleware.js` | multer memoryStorage + Cloudinary upload; `uploadImages` and `uploadExcel` instances |
| `src/middleware/errorHandler.js` | Global JSON error handler |
| `src/routes/adminRoutes.js` | All `/admin/*` routes (auth-gated) |

### Frontend — Storefront

| Path | Purpose |
|------|---------|
| `src/App.js` | Route definitions — admin area isolated from storefront |
| `src/layouts/MainLayout.jsx` | Header, search, nav, footer wrapper |
| `src/utils/currency.js` | `formatVND`, `imgSrc`, `discountPercent`, `sellingPrice` |
| `src/utils/constants.js` | DELIVERY_OPTIONS, SORT_OPTIONS |
| `src/store/store.js` | Redux store configuration |
| `src/store/slices/promoSlice.js` | Stores `{ code, discountType, discountValue }` |

### Frontend — Admin

| Path | Purpose |
|------|---------|
| `src/admin/api/adminClient.js` | Axios instance for admin API, auto-attaches JWT, redirects on 401 |
| `src/admin/hooks/useAdminProducts.js` | All admin product mutations incl. `useExportProducts` |
| `src/admin/hooks/useAdminCategories.js` | Category CRUD hooks |
| `src/admin/hooks/useAdminVouchers.js` | Voucher CRUD hooks |
| `src/admin/pages/ProductsPage.jsx` | Product list with filters, import, export |
| `src/admin/pages/ProductEditPage.jsx` | Full product form: rich text, Cloudinary images, voucher sync |
| `src/admin/pages/CategoriesPage.jsx` | Category + subcategory CRUD, seed defaults button |
| `src/admin/pages/VouchersPage.jsx` | Voucher CRUD with scope targeting |
| `src/admin/components/ProtectedRoute.jsx` | Redirects to `/admin/login` if no JWT in localStorage |

---

## Admin panel

Protected area at `/admin`. Login credentials set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

### Key behaviours
- **Categories** are stored in MongoDB (`Category` collection), not hardcoded. The storefront `categoryController` falls back to a product aggregate if the collection is empty.
- **Vouchers** (`Voucher` model) are validated by `promoController` at checkout alongside legacy `PromoCode` records. Response shape: `{ code, discountType: 'percentage'|'fixed', discountValue }`.
- **Product images** are uploaded to Cloudinary (free tier). `imgSrc()` handles both Cloudinary URLs and legacy local filenames.
- **Excel import** upserts by `productCode`. Accepts both Vietnamese and English column headers. Timeout on the frontend is 5 minutes (`300000ms`).
- **Excel export** streams directly from Express using ExcelJS; uses `responseType: 'blob'` on the frontend and triggers a browser download. Respects all active filters.
- **Rich text** description editor uses `react-quill-new` (React 19-compatible fork of react-quill v2).

---

## Promo / voucher flow

1. Admin creates a **Voucher** via `/admin/vouchers` → stored in `Voucher` collection.
2. Storefront POSTs to `POST /api/v1/promos/validate` with `{ code }`.
3. `promoController` checks `PromoCode` first (legacy), then `Voucher`.
4. Returns `{ code, discountType, discountValue }` on success.
5. Frontend `promoSlice` stores this; `CheckoutPage` calculates discount:
   - `percentage` → `Math.round(subtotal * discountValue / 100)`
   - `fixed` → `Math.min(discountValue, subtotal)`

---

## Database

- **Database**: MongoDB Atlas (M0 free tier is sufficient for dev).
- **Full-text search** uses the native `$text` index on `name` + `brand` (works on M0).
- Indexes are declared inside `Product.js` — do not add ad-hoc indexes in queries.

---

## Environment variables

### `vgp-backend/.env`
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/vgp
CORS_ORIGIN=http://localhost:3000

# Admin auth
ADMIN_EMAIL=admin@vgp.com
ADMIN_PASSWORD=your-password
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=8h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### `vgp-frontend/.env`
```
REACT_APP_API_URL=http://localhost:3001/api/v1
```

---

## What NOT to do

- Do not add Redux state for server data — use React Query.
- Do not return HTML from any API endpoint (except Excel export which streams binary).
- Do not skip `asyncWrapper` on new controllers.
- Do not add speculative abstractions or helpers for one-time use.
- Do not commit `.env` files.
- Do not register `:param` routes before static paths in `adminRoutes.js` — `/products/export`, `/products/import`, `/products/upload-images` must come before `/products/:code`.
- Do not use the storefront `apiClient` for admin API calls — use `adminClient`.
