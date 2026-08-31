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
}
