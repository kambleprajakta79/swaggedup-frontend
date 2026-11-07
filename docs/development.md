# Development Guide

## Running Locally

```bash
# Terminal 1 — backend (port 3000)
cd ../backend
npm install
cp .env.example .env
npm run start:dev

# Terminal 2 — frontend (port 4200)
npm install
npm start
```

The dev build targets `http://localhost:3000` (from `src/environments/environment.ts`).

## Commands

```bash
npm start          # dev server with reload
npm run build      # production build → dist/frontend/browser
npm run watch      # build watch mode
npm test           # Vitest unit tests
```

## Adding a New Feature

1. Create a feature folder `src/app/<feature>/` with a standalone component (`.ts` + `.html`).
2. Add a route file `<feature>-routes.ts` exporting `Routes` as default; wire it via `loadChildren` in the appropriate parent (`app.routes.ts` for top-level, `admin-routes.ts` for admin pages).
3. Use `inject()` for dependencies; services are `providedIn: 'root'`.
4. API calls go through domain services (`ProductService`, etc.) built on `ApiService` — never `HttpClient` directly in components. Unwrap list envelopes in the service (`map`).
5. Surface errors/success via `ToastService`.
6. Style with Tailwind utilities inline in templates; use the `@theme` tokens (gold/charcoal, Cinzel/Outfit) from `src/styles.css`.

### Conventions

| Concern      | Convention                                                    |
| ------------ | ------------------------------------------------------------- |
| Components   | Standalone, `inject()` over constructor injection            |
| Guards       | Functional `CanActivateFn` (`authGuard`, `guestGuard`)         |
| Interceptors | Functional (`authInterceptor`)                                |
| State        | BehaviorSubject (cart/auth/toasts), signal (wishlist) + localStorage |
| Routes       | Lazy-loaded feature route files with default export           |
| Styling      | Tailwind 4 utilities + `@theme` design tokens                  |

## Testing

Vitest 4 + jsdom (configured in `angular.json`, replaces Karma/Jest):

```bash
npm test
```

> Only the default `app.spec.ts` exists. See [known-gaps.md](./known-gaps.md).

## Deployment (Vercel)

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- The catch-all rewrite supports client-side routing (deep links like `/order/SW-20260917-0001` load the app).
- The production build uses `environment.prod.ts` → `https://swaggedup-backend.onrender.com` (Render-hosted NestJS backend).
- Build budgets (angular.json): 500kB warn / 1MB error initial bundle; 4kB/8kB component styles.

## Environments

| File                    | `apiUrl`                                  |
| ----------------------- | ----------------------------------------- |
| `environment.ts` (dev)  | `http://localhost:3000`                   |
| `environment.prod.ts`  | `https://swaggedup-backend.onrender.com`  |

To point a local build at a different backend, edit `environment.ts` (or add an `environment.development.ts` override with file replacements in `angular.json`).
