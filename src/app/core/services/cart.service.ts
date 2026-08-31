import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ProductVariant } from '../models/product-variant.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.itemsSubject.next(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse saved cart data:', e);
          this.itemsSubject.next([]);
        }
      }
    }
  }

  private saveCart(items: CartItem[]) {
    this.itemsSubject.next(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }

  openCart() {
    this.isOpenSubject.next(true);
  }

  closeCart() {
    this.isOpenSubject.next(false);
  }

  toggleCart() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  addToCart(product: Product, variant: ProductVariant, quantity = 1): boolean {
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(
      (item) => item.product.id === product.id && item.variant.id === variant.id
    );

    if (existingIndex > -1) {
      const newQty = currentItems[existingIndex].quantity + quantity;
      if (newQty > variant.stock) {
        // Cannot add more than available stock
        return false;
      }
      currentItems[existingIndex].quantity = newQty;
    } else {
      if (quantity > variant.stock) {
        // Cannot add more than available stock
        return false;
      }
      currentItems.push({ product, variant, quantity });
    }

    this.saveCart(currentItems);
    this.openCart(); // Slide cart out when adding new item
    return true;
  }

  updateQuantity(productId: number, variantId: number, change: number): boolean {
    let success = true;
    const currentItems = this.itemsSubject.value.map((item) => {
      if (item.product.id === productId && item.variant.id === variantId) {
        const newQty = item.quantity + change;
        if (newQty < 1 || newQty > item.variant.stock) {
          success = false;
          return item; // Do nothing if out of bounds
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });

    if (success) {
      this.saveCart(currentItems);
    }
    return success;
  }

  removeFromCart(productId: number, variantId: number) {
    const filtered = this.itemsSubject.value.filter(
      (item) => !(item.product.id === productId && item.variant.id === variantId)
    );
    this.saveCart(filtered);
  }

  clearCart() {
    this.saveCart([]);
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.itemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }
}
