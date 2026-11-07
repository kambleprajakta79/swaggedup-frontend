import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const addAuth = (r: HttpRequest<unknown>) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  return next(addAuth(req)).pipe(
    tap({
      error: (err) => {
        if (
          err instanceof HttpErrorResponse &&
          err.status === 401 &&
          typeof window !== 'undefined' &&
          localStorage.getItem('token')
        ) {
          // Expired/invalid token: clear it and send the user to log in again.
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      },
    })
  );
};
