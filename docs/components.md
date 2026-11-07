# Components & Features

## Storefront

### Home (`/`)
Loads top 5 categories, featured products, and new arrivals. `quickAdd()` picks the first in-stock variant and adds it to the cart (opens the drawer).

### Product List (`/shop`, `/category/:slug`)
- Full filter UI: search, category, price range, sizes (S–XL / 7–10 / One Size), sort, pagination (12/page).
- **URL query-param synced** — filters are reflected in the URL via `combineLatest(params, queryParams)`, so filtered views are shareable/bookmarkable.
- Mobile filter drawer, skeleton loading, wishlist-only view (`?filter=wishlist` — client-side filtering).

### Product Detail (`/shop/:slug`)
Image gallery, variant (size) selection with stock checks, quantity stepper, add-to-cart, buy-now (→ checkout), related products from the same category (up to 4).

### Cart
- **CartDrawer** — slide-out overlay in the storefront layout; subscribes to `items$`/`isOpen$`; qty update/remove/checkout.
- **CartPage** (`/cart`) — full-page cart with subtotal/shipping/total (₹150 shipping, free ≥ ₹5000 — mirrors backend rules).

### Checkout (`/checkout`)
4-step wizard using a single reactive `FormGroup`:

1. Customer info
2. Shipping address
3. Review
4. Payment method (COD default)

Redirects to `/shop` if the cart is empty. On submit: `POST /orders` (items as productId/productVariantId/quantity/price) → clear cart → navigate to `/order/:orderNumber`.

### Order Tracking (`/order/:orderNumber`)
Public order lookup by number with a status timeline stepper (PENDING → DELIVERED).

## Admin

All admin pages (except login) render inside `AdminLayoutComponent` (sidebar + logout) behind `authGuard`.

### Admin Login (`/admin/login`, `guestGuard`)
Email/password reactive form → `AuthService.login()`.

### Dashboard (`/admin/dashboard`)
Stats from `GET /admin/orders/dashboard/stats`: total orders, revenue (PAID), pending orders, recent orders, low-stock products.

### Products (`/admin/products`)
Product table (limit 100) + modal create/edit with reactive form:
- **Variants manager** — dynamic size/SKU/price/stock rows with SKU uniqueness check.
- **Image upload** via `ImageUploadService` (client-side resize/WebP → base64).
- Activate/deactivate toggle, delete with confirmation.

### Categories (`/admin/categories`)
CRUD modal (name/description/image).

### Orders (`/admin/orders`)
Orders table + detail modal with order-status and payment-status dropdowns that PATCH the backend and refresh.

### Inventory (`/admin/inventory`)
Variant-level inventory rows (flattened from products, limit 200), search by name/SKU, category filter, low-stock-only (≤5) filter.

## Shared Components (`src/app/shared/components/`)

| Component            | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `navbar`             | Search → `/shop?search=`, mobile menu, cart/wishlist counts   |
| `footer`             | Storefront footer                                              |
| `product-card`       | Image, price from first variant, wishlist toggle, quick-add, color-dot |
| `product-grid`       | Composes card + skeleton + empty-state                        |
| `skeleton-loader`    | Grid/card/list skeleton variants                               |
| `empty-state`        | Empty results placeholder                                      |
| `loading-spinner`    | Spinner                                                        |
| `confirmation-modal` | Confirm destructive actions                                    |
| `toast`              | Renders global toasts (mounted in root `App`)                 |
