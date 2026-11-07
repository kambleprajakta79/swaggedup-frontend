import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin-area guard: only ADMIN and MANAGER roles may enter.
 * Waits for the profile to load before deciding (handles page refresh).
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }

  return authService.waitForProfile().then((user) => {
    if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      return true;
    }
    // Logged in but not admin/manager → send to storefront
    router.navigate(['/']);
    return false;
  });
};

/**
 * Customer-area guard: any logged-in user (typically CUSTOMER).
 */
export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  return authService.waitForProfile().then((user) => {
    if (user) {
      return true;
    }
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  });
};
