import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private api = inject(ApiService);

  private wishlistKey = 'swaggedup_wishlist';
  public items = signal<number[]>(this.loadWishlist());

  private loadWishlist(): number[] {
    const data = localStorage.getItem(this.wishlistKey);
    return data ? JSON.parse(data) : [];
  }

  private isLoggedIn(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  }

  private persist(ids: number[]) {
    this.items.set(ids);
    localStorage.setItem(this.wishlistKey, JSON.stringify(ids));
  }

  /** Toggle wishlist state. Syncs to server when logged in; always updates local storage. */
  public toggle(productId: number): boolean {
    const current = this.items();
    const added = !current.includes(productId);
    const updated = added
      ? [...current, productId]
      : current.filter(id => id !== productId);
    this.persist(updated);

    // Server sync (fire-and-forget; only when logged in)
    if (this.isLoggedIn()) {
      if (added) {
        this.api.post(`/wishlist/${productId}`, {}).subscribe();
      } else {
        this.api.delete(`/wishlist/${productId}`).subscribe();
      }
    }
    return added;
  }

  public has(productId: number): boolean {
    return this.items().includes(productId);
  }

  public getCount(): number {
    return this.items().length;
  }

  /** Merge local wishlist into the server account (call once after login). */
  public mergeToServer(): Observable<Product[]> {
    const localIds = this.items();
    return this.api.post<{ products: Product[] }>('/wishlist/merge', { productIds: localIds }).pipe(
      tap((res) => {
        // Adopt the server's canonical list
        this.persist(res.products.map((p) => p.id));
      }),
      map((res) => res.products)
    );
  }

  getServerWishlist(): Observable<Product[]> {
    return this.api.get<Product[]>('/wishlist');
  }

  removeFromServer(productId: number): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/wishlist/${productId}`).pipe(
      tap(() => {
        this.persist(this.items().filter(id => id !== productId));
      })
    );
  }
}
