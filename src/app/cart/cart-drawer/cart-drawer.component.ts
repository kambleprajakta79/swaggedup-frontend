import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-drawer.component.html',
})
export class CartDrawerComponent implements OnInit {
  public cartService = inject(CartService);
  private router = inject(Router);

  items: CartItem[] = [];
  isOpen = false;
  subtotal = 0;

  ngOnInit() {
    this.cartService.items$.subscribe((items) => {
      this.items = items;
      this.subtotal = this.cartService.getSubtotal();
    });

    this.cartService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
  }

  close() {
    this.cartService.closeCart();
  }

  updateQty(item: CartItem, change: number) {
    this.cartService.updateQuantity(item.product.id, item.variant.id, change);
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.variant.id);
  }

  checkout() {
    this.close();
    this.router.navigate(['/checkout']);
  }
}
