# Known Gaps & Roadmap

The frontend is functional but has documented limitations. None block local development.

## Gaps

- **No role check in `authGuard`** — only token presence is checked; `AuthService.isAdmin()` exists but isn't enforced at route level. Any logged-in user (regardless of role) can reach admin routes client-side (the backend still enforces ADMIN on admin endpoints).
- **No global HTTP error interceptor** — errors are handled per-call-site via `ToastService`; a failed call that forgets to subscribe to the error path fails silently.
- **Wishlist filtering is client-side** — `?filter=wishlist` filters only the currently fetched page, not the full catalog server-side.
- **Minimal test coverage** — only the default `app.spec.ts`; Vitest is configured but unused.
- **No e2e framework** installed.
- **Mixed state patterns** — BehaviorSubject (cart/auth/toasts) vs signal (wishlist); intentional but worth knowing when adding features.

## Roadmap

- Add a role check to `authGuard` (e.g., `router.createUrlTree` to a 403 page when `!isAdmin()`).
- Add a global HTTP error interceptor that routes errors to `ToastService` and handles 401 (auto-logout + redirect to `/admin/login`).
- Move wishlist filtering server-side (backend `?ids=` param or a wishlist endpoint).
- Add unit tests for services (CartService stock validation, AuthService, envelope unwrapping) and component tests for checkout.
- Add e2e tests (Playwright/Cypress) for the critical path: browse → cart → checkout → tracking.
- Consider consolidating state management on signals as Angular evolves.
- Backend-side roadmap (Swagger, rate limiting, registration, secured order tracking, tests) is documented in [`../../backend/docs/known-gaps.md`](../../backend/docs/known-gaps.md).
