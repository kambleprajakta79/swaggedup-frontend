import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistKey = 'swaggedup_wishlist';
  public items = signal<number[]>(this.loadWishlist());

  private loadWishlist(): number[] {
    const data = localStorage.getItem(this.wishlistKey);
    return data ? JSON.parse(data) : [];
  }

  public toggle(productId: number): boolean {
    const current = this.items();
    let updated: number[];
    let added = false;
    if (current.includes(productId)) {
      updated = current.filter(id => id !== productId);
    } else {
      updated = [...current, productId];
      added = true;
    }
    this.items.set(updated);
    localStorage.setItem(this.wishlistKey, JSON.stringify(updated));
    return added;
  }

  public has(productId: number): boolean {
    return this.items().includes(productId);
  }

  public getCount(): number {
    return this.items().length;
  }
}
