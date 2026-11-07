# Services & API Integration

All services live in `src/app/core/services/`, are `providedIn: 'root'`, and use `inject()`.

## ApiService

Thin typed wrapper over `HttpClient` against `environment.apiUrl` — `get/post/put/patch/delete`. All domain services go through it; components never call `HttpClient` directly.

## Domain Services & Endpoints

### AuthService
| Method | Endpoint           | Notes                                    |
| ------ | ------------------ | ---------------------------------------- |
| login  | `POST /auth/login` | Stores `token` in localStorage           |
| me     | `GET /auth/me`     | Fetched on startup (`checkInitialAuth`)  |

State: `BehaviorSubject<User | null>`. Helpers: `isLoggedIn()`, `isAdmin()`, `logout()`.

### ProductService
| Method        | Endpoint                          |
| ------------- | --------------------------------- |
| getProducts   | `GET /products` (search, category, minPrice, maxPrice, sizes, sort, page, limit) |
| getProduct    | `GET /products/:slug`             |
| getFeatured   | `GET /products/featured`          |
| getNewArrivals| `GET /products/new-arrivals`      |
| search        | `GET /products/search?q=`         |
| create/update/delete | `POST/PATCH/DELETE /products[/:id]` (admin) |

### CategoryService
`GET /categories`, `GET /categories/:slug`; admin `POST/PATCH/DELETE /categories[/:id]`.

### OrderService
| Method              | Endpoint                                    |
| ------------------- | ------------------------------------------- |
| createOrder         | `POST /orders`                              |
| trackOrder         | `GET /orders/:orderNumber`                  |
| getDashboardStats   | `GET /admin/orders/dashboard/stats`         |
| getOrders / getOrder| `GET /admin/orders[/:id]`                   |
| updateStatus       | `PATCH /admin/orders/:id/status`             |
| updatePaymentStatus| `PATCH /admin/orders/:id/payment-status`     |

### CartService
- `items$` / `isOpen$` `BehaviorSubject`s; persisted to `localStorage('cart')`.
- `addItem`/`updateQuantity` are **stock-validated** (return boolean success).
- Helpers: `subtotal`, `itemCount`, `clear`.

### WishlistService
Angular `signal<number[]>` persisted to `localStorage('swaggedup_wishlist')`. API: `toggle`, `has`, `getCount`.

### ToastService
`BehaviorSubject<Toast[]>` with success/error/info and auto-dismiss timers. Rendered globally by `<app-toast>` in the root `App`.

### ImageUploadService
Client-side image processing pipeline:
1. Validate type (JPG/PNG/WEBP) and 5MB limit.
2. Canvas resize to max 1600px.
3. WebP compression at 82% quality (JPEG fallback).
4. Return base64 data URLs (sent inline in product payloads — no multipart upload).

## Envelope Unwrapping

Backend list endpoints wrap responses as `{ <resource>: [...], total, page, limit }`. Services unwrap via RxJS `map` before exposing typed arrays to components.

## Interceptor

`authInterceptor` (functional): attaches `Authorization: Bearer <token>` from `localStorage('token')` to **every** request (SSR-safe `typeof window` check). There is no global error interceptor — components handle errors per subscription via `ToastService`.

## Models & Types

- `core/models/`: `Product`, `ProductVariant`, `Category`, `CartItem` (product + variant + quantity), `Order`/`OrderItem`, `User` (id, email, role).
- `core/types/`: `OrderStatus` and `PaymentStatus` unions with const arrays (used for dropdowns).
