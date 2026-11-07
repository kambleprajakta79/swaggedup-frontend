import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  
  constructor() {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = this.getToken();
    if (token) {
      this.getProfile().subscribe({
        next: (profile) => {
          if (profile) {
            this.userSubject.next(profile);
          }
        },
        error: () => this.logout(),
      });
    }
  }

  login(credentials: { email: string; password?: string }): Observable<{ accessToken: string }> {
    return this.api.post<{ accessToken: string }>('/auth/login', credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken);
      }),
      tap(() => {
        this.getProfile().subscribe((profile) => {
          if (profile) {
            this.userSubject.next(profile);
          }
        });
      })
    );
  }

  /** Customer registration step 1: sends OTP to email. */
  register(data: { name?: string; email: string; phone?: string; password?: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/register', data);
  }

  /** Customer registration step 2: verify OTP → set password → logged in. */
  verifyOtp(email: string, code: string, password: string): Observable<{ accessToken: string }> {
    return this.api.post<{ accessToken: string }>('/auth/verify-otp', { email, code, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken);
        this.getProfile().subscribe((profile) => {
          if (profile) {
            this.userSubject.next(profile);
          }
        });
      })
    );
  }

  resendOtp(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/resend-otp', { email });
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/forgot-password', { email });
  }

  getFullProfile(): Observable<User> {
    return this.api.get<User>('/auth/profile');
  }

  updateProfile(data: { name?: string; phone?: string }): Observable<User> {
    return this.api.patch<User>('/auth/profile', data).pipe(
      tap((updated) => this.userSubject.next(updated))
    );
  }

  getProfile(): Observable<User | null> {
    return this.api.get<User>('/auth/me').pipe(
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user !== null && user.role === 'ADMIN';
  }

  isAdminOrManager(): boolean {
    const user = this.userSubject.value;
    return user !== null && (user.role === 'ADMIN' || user.role === 'MANAGER');
  }

  isCustomer(): boolean {
    const user = this.userSubject.value;
    return user !== null && user.role === 'CUSTOMER';
  }

  /**
   * Resolves once the initial profile check has finished (handles page refresh
   * where the token exists but the profile is still being fetched).
   */
  waitForProfile(): Promise<User | null> {
    if (this.userSubject.value) {
      return Promise.resolve(this.userSubject.value);
    }
    if (!this.getToken()) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const sub = this.user$.subscribe({
        next: (user) => {
          if (user) {
            sub.unsubscribe();
            resolve(user);
          }
        },
        error: () => {
          sub.unsubscribe();
          resolve(null);
        },
      });
      // Safety timeout: profile fetch failed silently
      setTimeout(() => {
        sub.unsubscribe();
        resolve(this.userSubject.value);
      }, 5000);
    });
  }
}
