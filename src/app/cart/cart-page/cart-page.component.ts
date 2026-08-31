import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent implements OnInit {
  public cartService = inject(CartService);
  private router = inject(Router);

  items: CartItem[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;

  ngOnInit() {
    this.cartService.items$.subscribe((items) => {
      this.items = items;
      this.calculateTotals();
    });
  }

  private calculateTotals() {
    this.subtotal = this.cartService.getSubtotal();
    this.shipping = this.subtotal >= 5000 || this.subtotal === 0 ? 0 : 150;
    this.total = this.subtotal + this.shipping;
  }

  updateQty(item: CartItem, change: number) {
    this.cartService.updateQuantity(item.product.id, item.variant.id, change);
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.variant.id);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
