# VƯƠNG GIA PHÚ — vpg-app

E-commerce website for Vương Gia Phú, a Vietnamese retailer of high-end sanitary fixtures and furniture.

---

## Repository structure

```
vpg-app/
├── vgp-backend/          # Express + MongoDB REST API (port 3001)
│   ├── src/
│   │   ├── app.js        # Express app (middleware, routes)
│   │   ├── server.js     # Entry point — connects DB, starts server
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Request handlers (thin — delegate to services)
│   │   ├── middleware/   # asyncWrapper, errorHandler, notFound
│   │   ├── models/       # Mongoose schemas: Product, Order, PromoCode
│   │   ├── routes/       # Express routers
│   │   └── services/     # All MongoDB query logic
│   ├── scripts/          # Seed script
│   └── package.json
│
├── vgp-frontend/         # React 19 SPA (port 3000)
│   ├── src/
│   │   ├── api/          # Axios client + endpoint functions
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # React Query hooks (useProducts, etc.)
│   │   ├── layouts/      # MainLayout (header, footer, modal)
│   │   ├── pages/        # Route-level page components
│   │   ├── store/        # Redux store + slices
│   │   └── utils/        # constants, currency formatter, form validation
│   └── package.json
│
├── CLAUDE.md             # Instructions for Claude Code
├── PRD.md                # Product Requirements Document
└── README.md             # This file
```

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A MongoDB connection string (MongoDB Atlas M0 free tier works)

---

## Setup

### 1. Backend

```bash
cd vgp-backend
npm install
```

Create `vgp-backend/.env`:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vgp
CORS_ORIGIN=http://localhost:3000
```

Seed the database (optional):

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001/api/v1`.  
Health check: `GET http://localhost:3001/health`

### 2. Frontend

```bash
cd vgp-frontend
npm install
```

Create `vgp-frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

Start the dev server:

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## Architecture

```
MongoDB Atlas
     │
     ▼
Mongoose models
     │  Product · Order · PromoCode
     ▼
Service layer        ← all DB queries live here
     │
     ▼
Express controllers  ← parse req, call service, return res.json()
     │
     ▼
REST API  /api/v1/
     │  /products  /categories  /orders  /promos
     ▼
React Query hooks    ← fetch, cache, and revalidate server data
     │
     ▼
Page components      ← render UI from hook data
     │
     ▼
Redux store          ← client-only state (cart, wishlist, promo, ui)
```

---

## API reference

Base URL: `http://localhost:3001/api/v1`

All responses use the shape `{ success: true, data: ... }` on success  
and `{ success: false, error: "<message>" }` on error.

### Products

| Method | Path | Query params | Description |
|--------|------|-------------|-------------|
| GET | `/products` | `page, limit, sort, category, subcategory, brand, sale, highlighted, minPrice, maxPrice, q` | Paginated product list |
| GET | `/products/featured` | `limit` | Featured products |
| GET | `/products/sale` | `page, limit` | Sale products |
| GET | `/products/:productCode` | — | Single product |
| GET | `/products/:productCode/similar` | `limit` | Similar products (same subcategory) |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | Category + subcategory tree |
| GET | `/categories/brands` | Brand list |

### Orders

| Method | Path | Description |
|--------|------|-------------|
| POST | `/orders` | Create order (prices snapshotted from DB) |
| GET | `/orders/:orderNumber` | Get order by number |

### Promos

| Method | Path | Description |
|--------|------|-------------|
| GET | `/promos/validate/:code` | Validate promo code |

---

## Frontend pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Hero, categories, featured & sale products |
| `/all` | AllProductsPage | Full catalogue with filters and pagination |
| `/category/:category/:subcategory` | ProductCategoriesPage | Filtered by category |
| `/sale` | SalesPage | Discounted products |
| `/:productCode` | ProductDetailsPage | Product info, gallery, add to cart |
| `/cart` | CartPage | Cart items, totals, checkout link |
| `/checkout` | CheckoutPage | Customer form, delivery, payment, order submit |

---

## Redux store slices

| Slice | Managed state |
|-------|---------------|
| `cart` | Items, quantities, order-success flag |
| `wishlist` | Saved products (in-memory, no persistence) |
| `promo` | Applied promo code + discount percentage |
| `ui` | Modal visibility/message, sidebar open state |
| `currency` | Selected display currency (VND by default) |

> Server data (products, categories) is **not** in Redux — it lives in React Query's cache.

---

## Key product fields

| Field | Type | Notes |
|-------|------|-------|
| `productCode` | String | Unique; used in URLs and cart |
| `price` | Number | Original price in VND |
| `discountPrice` | Number | `0` means no discount |
| `sale` | Boolean | Shown in sale listing |
| `highlighted` | Boolean | Shown in featured section |
| `isDisplay` | Boolean | Hidden from all listings if `false` |
| `images` | String[] | Filenames served from `/images/` |

---

## Order number format

Orders are auto-numbered as **VGP-YYYYMMDD-NNNN** (e.g. `VGP-20260412-0001`).

---

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `vgp-backend` | Start backend with nodemon |
| `npm start` | `vgp-backend` | Start backend (production) |
| `npm run seed` | `vgp-backend` | Seed MongoDB with sample data |
| `npm start` | `vgp-frontend` | Start React dev server |
| `npm run build` | `vgp-frontend` | Production build |

---

## Admin panel

The app includes a protected admin area at `/admin`.

### Access

| URL | Description |
|-----|-------------|
| `/admin/login` | Login page (credentials set in `.env`) |
| `/admin/products` | Product management — list, search, filter, edit, import |
| `/admin/categories` | Category management — CRUD, subcategory editor |
| `/admin/vouchers` | Voucher management — CRUD with scope targeting |

### Backend env vars required

Add these to `vgp-backend/.env`:

```env
# Admin login (plain text — do not commit)
ADMIN_EMAIL=admin@vgp.com
ADMIN_PASSWORD=your-password

# JWT signing
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=8h

# Cloudinary (free tier — cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### First-time category setup

The admin Categories page starts empty. Click **"Seed dữ liệu mặc định"** to populate it with the three default categories (Thiết Bị Vệ Sinh, Thiết Bị Nhà Bếp, Thiết Bị Nước) and their subcategories.

---

## Crawling product data from tdm.vn

`tdm_crawl.py` scrapes all products from [tdm.vn](https://www.tdm.vn) and produces an Excel file ready to import via **Admin → Products → Import Excel**.

### Requirements

- Python 3.9+
- Dependencies listed in `tdm_requirements.txt`

```bash
pip install -r tdm_requirements.txt
```

### Usage

```bash
# Crawl all ~457 products (~30–40 min with polite delays)
python tdm_crawl.py

# Quick test — first 10 products only
python tdm_crawl.py --limit 10

# Resume after an interruption (skips already-crawled products)
python tdm_crawl.py --resume

# Custom output filename
python tdm_crawl.py --output vgp_import_batch1.xlsx
```

### Output columns

The Excel file contains exactly the columns the import system expects:

| Column | Notes |
|--------|-------|
| `productCode` | Taken from the "Mã sản phẩm" field on each page; falls back to URL slug |
| `name` | Full product name from `<h1>` |
| `price` | Original/market price (the crossed-out price when on sale) |
| `discountPrice` | Current selling price when the product is on sale; `0` otherwise |
| `brand` | Normalised brand name (INAX, TOTO, Caesar, …) |
| `category` | Mapped to VGP category (Thiết Bị Vệ Sinh / Nhà Bếp / Nước) |
| `subcategory` | Mapped to VGP subcategory (Bồn cầu, Chậu Lavabo, …) |
| `quantity` | Set to `0` — update manually after import |
| `description` | Full HTML description from the product page |
| `images` | Comma-separated Cloudinary-ready URLs (max 8, 1090 × 1090 px) |
| `sale` | `TRUE` if a discount price is detected |
| `highlighted` | `FALSE` by default — set manually in admin |
| `isDisplay` | `TRUE` by default |

### How it works

1. **URL discovery** — fetches `/sitemaps/en-gb.sitemap.products.xml` to get all product URLs (no pagination parameters, so it respects `robots.txt`).
2. **Scraping** — for each URL, parses: `<h1>` (name), `div.price > s / strong` (prices), `ul.breadcrumb` (category), `/image/cache/catalog/` `<img>` tags (images), "Mã sản phẩm" label (SKU).
3. **Category mapping** — 40-keyword map converts TDM breadcrumb text to VGP category/subcategory values.
4. **Checkpoint** — progress is saved to `tdm_checkpoint.json` every 10 products. If the script is interrupted, run with `--resume` to continue from where it stopped.
5. **Rate limiting** — 2–4.5 s random delay between requests.

### Importing the file

1. Open **Admin → Products**.
2. Click **📥 Import Excel**.
3. Upload the generated `.xlsx` file.
4. The import upserts by `productCode` — running it twice is safe.

### Logs

The script writes detailed logs to `tdm_crawl.log` in the same directory. Check this file if any products are listed as failed in the summary.

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 |
| State (server) | TanStack React Query v5 |
| State (client) | Redux Toolkit |
| UI library | Bootstrap 5 |
| HTTP client | Axios |
| Routing | React Router v7 |
| Backend framework | Express 4 |
| ODM | Mongoose 8 |
| Database | MongoDB Atlas |
| Security | Helmet, CORS whitelist |
| Logging | Morgan |
