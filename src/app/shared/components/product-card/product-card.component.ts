import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() quickAdd = new EventEmitter<Product>();

  public wishlistService = inject(WishlistService);
  private toastService = inject(ToastService);

  onQuickAdd(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.quickAdd.emit(this.product);
  }

  get isInStock(): boolean {
    return this.product.variants && this.product.variants.some(v => v.stock > 0);
  }

  get displayPrice(): number {
    if (this.product.variants && this.product.variants.length > 0) {
      return this.product.variants[0].price;
    }
    return this.product.basePrice;
  }

  get isWishlisted(): boolean {
    return this.wishlistService.has(this.product.id);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const added = this.wishlistService.toggle(this.product.id);
    if (added) {
      this.toastService.success(`Added ${this.product.name} to Wishlist`);
    } else {
      this.toastService.info(`Removed ${this.product.name} from Wishlist`);
    }
  }

  getColorHex(colorName?: string): string {
    if (!colorName) return '#eaeaec';
    const normalized = colorName.toLowerCase().trim();
    const map: { [key: string]: string } = {
      taupe: '#b3a394',
      camel: '#c19a6b',
      navy: '#1d2a44',
      charcoal: '#36454f',
      black: '#111111',
      white: '#fafafa',
      cream: '#fdf6e2',
      olive: '#556b2f',
      grey: '#8a8a8a',
      gray: '#8a8a8a',
      brown: '#704214',
      beige: '#f5f5dc',
    };
    return map[normalized] || '#c5a880';
  }
}
