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
    │  Product · Order · PromoCode
    ▼
Service layer (src/services/productService.js)
    │  All DB queries live here — controllers stay thin
    ▼
Controllers (src/controllers/)
    │  Parse req, call service, shape res.json()
    ▼
Express router  /api/v1/
    │  /products  /categories  /orders  /promos
    ▼
React Query hooks (src/hooks/useProducts.js)
    │  fetch → cache → staleTime
    ▼
Page components (src/pages/)
    │  AllProductsPage · ProductDetailsPage · SalesPage …
    ▼
Redux store (client-only state)
    │  cart · wishlist · promo · ui · currency
    ▼
User's browser
```

---

## Coding conventions

### Backend
- **All routes return JSON** — never HTML.
- Controllers must stay thin. Put all query logic in `src/services/`.
- Wrap async controllers with `asyncWrapper` middleware so unhandled promise rejections are forwarded to `errorHandler`.
- Error shape: `{ success: false, error: "<message>" }` with the correct HTTP status.
- Environment variables are loaded via `dotenv` in `server.js`. Never hard-code secrets.

### Frontend
- **Server data** → React Query (`useQuery`). Never store API data in Redux.
- **Client-only state** → Redux slices (`cart`, `wishlist`, `promo`, `ui`, `currency`).
- Use `camelCase` for variables/functions, `PascalCase` for components.
- Use `async/await`, not `.then()` chains.
- Vietnamese strings go directly in JSX — no i18n layer.
- Currency formatting: always use `formatVND()` from `src/utils/currency.js`.
- Images are served from `/images/<filename>` (public folder or CDN). Fall back to `/images/placeholder.jpg` on error.

---

## Key files to know

| Path | Purpose |
|------|---------|
| `vgp-backend/src/app.js` | Express app setup (helmet, cors, morgan, routes) |
| `vgp-backend/src/models/Product.js` | Mongoose schema + compound indexes |
| `vgp-backend/src/services/productService.js` | All MongoDB query logic |
| `vgp-backend/src/middleware/errorHandler.js` | Global JSON error handler |
| `vgp-frontend/src/App.js` | Route definitions |
| `vgp-frontend/src/layouts/MainLayout.jsx` | Header, search, nav, footer wrapper |
| `vgp-frontend/src/utils/constants.js` | CATEGORIES, BRANDS, SORT_OPTIONS, DELIVERY_OPTIONS |
| `vgp-frontend/src/store/store.js` | Redux store configuration |

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
```

### `vgp-frontend/.env`
```
REACT_APP_API_URL=http://localhost:3001/api/v1
```

---

## What NOT to do

- Do not add Redux state for server data — use React Query.
- Do not return HTML from any API endpoint.
- Do not skip `asyncWrapper` on new controllers.
- Do not add speculative abstractions or helpers for one-time use.
- Do not commit `.env` files.
