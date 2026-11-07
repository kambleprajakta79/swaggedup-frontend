# Architecture

## System Overview

```mermaid
flowchart LR
    subgraph Browser
        APP[Angular 21 Standalone App]
    end

    subgraph Core["Core Layer (src/app/core)"]
        GUARDS[Guards<br/>authGuard · guestGuard]
        INTER[authInterceptor]
        SVCS[Services<br/>Api · Auth · Cart · Product · Category · Order · Toast · Wishlist · ImageUpload]
    end

    subgraph Features
        STORE[Storefront<br/>Home · Products · Cart · Checkout · Orders]
        ADMIN[Admin<br/>Dashboard · Products · Categories · Orders · Inventory]
    end

    subgraph Shared["Shared Components"]
        COMP[navbar · footer · product-card/grid · skeleton · toast · modal]
    end

    BE[("NestJS Backend<br/>localhost:3000 / Render")]

    APP --> GUARDS --> STORE
    APP --> ADMIN
    STORE & ADMIN --> SVCS
    SVCS --> INTER --> BE
    APP --> COMP
```

## Bootstrap Chain

`main.ts` → `bootstrapApplication(App, appConfig)` where `app.config.ts` provides:

- `provideBrowserGlobalErrorListeners()`
- `provideZoneChangeDetection({ eventCoalescing: true })`
- `provideRouter(routes)`
- `provideHttpClient(withInterceptors([authInterceptor]))`

The root `App` component is just `<app-toast>` (global toasts) + `<router-outlet>`.

## Routing Architecture

Two layout shells, each lazy-loading feature route files (`loadChildren` + `export default`):

```mermaid
flowchart TD
    ROOT[app.routes.ts] --> SL[StorefrontLayout<br/>navbar + footer + cart drawer]
    ROOT --> AL[AdminLayout<br/>sidebar + logout<br/>authGuard]
    ROOT --> ALG[AdminLogin<br/>guestGuard]

    SL --> HOME[home-routes: / ]
    SL --> PROD[products-routes: /shop, /shop/:slug, /category/:slug]
    SL --> CART[cart-routes: /cart]
    SL --> CHECK[checkout-routes: /checkout]
    SL --> ORD[orders-routes: /order/:orderNumber]

    AL --> ADM[admin-routes: dashboard, products,<br/>categories, orders, inventory]
```

## State Management

No state library — three patterns coexist, all persisted where appropriate:

| Concern  | Pattern                           | Persistence                |
| -------- | --------------------------------- | -------------------------- |
| Cart     | `BehaviorSubject` (items + drawer) | `localStorage('cart')`     |
| Auth     | `BehaviorSubject<User>` + token   | `localStorage('token')`    |
| Wishlist | Angular `signal<number[]>`        | `localStorage`            |
| Toasts   | `BehaviorSubject<Toast[]>`        | —                          |

## Request Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Domain Service (Product/Order/…)
    participant A as ApiService
    participant I as authInterceptor
    participant BE as Backend

    C->>S: call method (e.g. getProducts(filters))
    S->>A: typed HTTP call vs environment.apiUrl
    A->>I: request
    I->>BE: + Authorization: Bearer <token> (from localStorage)
    BE-->>I: JSON (list envelope or entity)
    I-->>S: response
    S-->>C: unwrap envelope (map operators) → typed models
    C->>C: update component state / signals
```

Errors are handled per-call-site: components subscribe and route errors to `ToastService` (there is no global error interceptor).

## Styling

Tailwind CSS 4 via `@import 'tailwindcss'` with `@theme` tokens in `src/styles.css`:

- **Fonts**: Cinzel (display/serif) + Outfit (sans) from Google Fonts
- **Palettes**: `gold-50…900` (brand gold `#c5a880`) and `charcoal-50…950` (inverted — 950 is the white page background)
- Component styles are inline Tailwind utilities in templates; angular.json enforces 4–8kB component style budgets.
