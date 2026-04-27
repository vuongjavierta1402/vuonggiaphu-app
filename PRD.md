# PRD — VƯƠNG GIA PHÚ Shopping Website

**Version:** 1.0  
**Owner:** Vương Gia Phú  
**Status:** In development

---

## 1. Overview

Vương Gia Phú is a Vietnamese retailer of high-end sanitary fixtures (bathroom, kitchen) and furniture. This document describes the functional and non-functional requirements for the company's e-commerce website.

The site should give customers a polished, trustworthy shopping experience equivalent to established Vietnamese retailers such as tdm.vn, with Vietnamese-language UI throughout.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Allow customers to browse and order products online | Orders submitted via website |
| Reduce manual phone-order workload for staff | % of orders received via web |
| Surface promotions and featured products prominently | Click-through on sale/featured sections |
| Mobile-first browsing experience | ≥ 60 % mobile sessions without UX complaints |

---

## 3. Users

**Primary:** End customers (homeowners, contractors) browsing and purchasing fixtures.  
**Secondary:** Store staff managing orders (future admin panel — out of scope for v1).

---

## 4. Functional Requirements

### 4.1 Navigation & Layout

- Sticky top header with:
  - Brand logo linking to home
  - Full-width search bar (desktop) / collapsible search (mobile)
  - Shopping cart icon with item count badge
  - Hamburger menu on mobile
- Horizontal category mega-menu with hover-activated subcategory dropdowns
- Footer with store info, links, contact details

### 4.2 Home Page

- Hero banner with call-to-action buttons ("View Products", "Promotions")
- Trust-badge strip (free shipping, warranty, genuine products, etc.)
- Category grid linking to each product category
- "Featured Products" horizontal grid (up to 8 products)
- "Sale Products" section (up to 8 products)
- Brand quick-links (TOTO, INAX, VIGLACERA, AMERICAN STANDARD, Caesar, ATTAX, HAPHAKO)

### 4.3 Product Listing

- URL: `/all` (all products), `/category/:category/:subcategory` (filtered), `/sale` (sale items)
- Sidebar filters:
  - Sort (Newest, Price ↑, Price ↓, Top Rated)
  - Price range (min / max slider or inputs)
  - Brand checkboxes
- Page-size selector (12 / 24 / 48)
- Pagination (ellipsis-style, scroll-to-top on page change)
- Each product card shows: image, name, price, discount price, discount percentage badge, "Add to Cart" button

### 4.4 Product Detail

- URL: `/:productCode`
- Image gallery: large main image + thumbnail strip (up to 6 thumbnails)
- Product info: name, rating + vote count, brand badge, sell price, original price strike-through, discount % badge
- Quantity selector (1–10, capped)
- "Add to Cart" and "Add to Wishlist" buttons
- Product meta: code, brand, category, subcategory
- PDF/document attachments list
- Description section (supports HTML from CMS)
- "Related Products" (bought-with bundle / parts)
- "Similar Products" (same subcategory)

### 4.5 Search

- Full-text search across product name and brand
- Results displayed on `/all?q=<query>`
- Returns message if no results found

### 4.6 Cart

- URL: `/cart`
- Lists all cart items: image, name, unit price, quantity controls (−/+), line total, remove button
- "Clear all" button
- Order summary sidebar: subtotal, discount (if promo applied), total
- Link to checkout
- Post-order success state replaces cart with confirmation message

### 4.7 Checkout

- URL: `/checkout`
- Redirects to `/all` if cart is empty
- Customer info form: first name, last name, email, phone, delivery address (all required)
- Delivery method selection (Standard / Express with price and ETA)
- Payment method selection (Cash on Delivery / Bank Transfer)
- Promo code input with live validation against the API
- Order summary: itemised list, subtotal, shipping, discount, grand total
- On submit: validates form, calls POST `/api/v1/orders`, navigates to `/cart` (success state)

### 4.8 Wishlist

- Toggled from the Product Detail page (heart icon)
- State persisted in Redux (in-memory; no user accounts in v1)

### 4.9 Promo Codes

- Applied at checkout
- Backend validates code (active, not expired, under usage limit)
- Discount is a percentage off subtotal

---

## 5. API Endpoints

All responses: `Content-Type: application/json`.  
Success shape: `{ success: true, data: <payload> }`.  
Error shape: `{ success: false, error: "<message>" }`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/products` | List products (paged, filterable, sortable, searchable) |
| GET | `/api/v1/products/featured` | Featured products |
| GET | `/api/v1/products/sale` | Sale products (paged) |
| GET | `/api/v1/products/:productCode` | Single product |
| GET | `/api/v1/products/:productCode/similar` | Similar products by subcategory |
| GET | `/api/v1/categories` | Category + subcategory tree |
| GET | `/api/v1/categories/brands` | Brand list |
| POST | `/api/v1/orders` | Create order (prices snapshotted from DB) |
| GET | `/api/v1/orders/:orderNumber` | Get order by order number |
| GET | `/api/v1/promos/validate/:code` | Validate a promo code |

---

## 6. Data Models

### Product
| Field | Type | Notes |
|-------|------|-------|
| productCode | String | Unique, used as URL slug |
| name | String | Required |
| price | Number | Original price (VND) |
| discountPrice | Number | 0 = no discount |
| description | String | HTML allowed |
| brand | String | Indexed |
| images | [String] | Filenames served from `/images/` |
| category | String | Top-level category |
| subcategory | String | Sub-level category |
| quantity | Number | Stock count |
| isDisplay | Boolean | Hidden if false |
| sale | Boolean | Appears in sale listing |
| highlighted | Boolean | Appears in featured section |
| ratings | Object | `{ star_ratings, votes }` |
| relatedProducts | [Object] | Bundle / combo items |
| partProducts | [Object] | Accessory / part items |
| attachments | [Object] | `{ name, link }` PDF docs |

### Order
| Field | Type | Notes |
|-------|------|-------|
| orderNumber | String | Auto-generated `VGP-YYYYMMDD-NNNN` |
| customer | Object | firstName, secondName, email, phone, address |
| items | [Object] | Price snapshotted from DB at order time |
| deliveryOption | Object | id, name, cost, duration |
| paymentMethod | Enum | `onDelivery` · `bankTransfer` · `creditCard` |
| promoCode | String | Applied code (if any) |
| promoDiscount | Number | Percentage value |
| subtotal / shippingCost / total | Number | VND |
| status | Enum | `pending` → `confirmed` → `processing` → `shipped` → `delivered` · `cancelled` |

### PromoCode
| Field | Type | Notes |
|-------|------|-------|
| code | String | Unique, uppercase |
| percentage | Number | 0–100 |
| active | Boolean | |
| expiresAt | Date | null = never expires |
| usageLimit | Number | null = unlimited |
| usageCount | Number | Incremented on use |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| API response time (p95) | < 500 ms |
| Mobile responsiveness | All pages usable on 375 px width |
| Security | Helmet headers, CORS whitelist, payload size limit (10 kb JSON) |
| Database | MongoDB Atlas M0 (free tier) for development; can upgrade |
| No auth in v1 | No user accounts; wishlist and cart are session-only |

---

## 8. Out of Scope (v1)

- Admin dashboard (product / order management)
- User authentication and order history
- Payment gateway integration (credit card)
- Email order confirmation
- Product reviews / ratings submitted by users
- Multi-language support
- Inventory deduction on order placement
