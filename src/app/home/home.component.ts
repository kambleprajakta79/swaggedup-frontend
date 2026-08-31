import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../core/services/product.service';
import { CategoryService } from '../core/services/category.service';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { Product } from '../core/models/product.model';
import { Category } from '../core/models/category.model';
import { ProductCardComponent } from '../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  categories: Category[] = [];
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.slice(0, 5); // Take top 5 categories for home
      },
      error: () => this.toastService.error('Failed to load categories')
    });

    this.productService.getFeatured().subscribe({
      next: (data) => {
        this.featuredProducts = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load featured products');
        this.loading = false;
      }
    });

    this.productService.getNewArrivals().subscribe({
      next: (data) => {
        this.newArrivals = data;
      },
      error: () => this.toastService.error('Failed to load new arrivals')
    });
  }

  quickAdd(product: Product) {
    if (!product.variants || product.variants.length === 0) {
      this.toastService.error('This product is currently unavailable.');
      return;
    }

    // Default to first variant with stock
    const inStockVariant = product.variants.find((v) => v.stock > 0);
    if (!inStockVariant) {
      this.toastService.error('Product is out of stock in all sizes.');
      return;
    }

    const added = this.cartService.addToCart(product, inStockVariant, 1);
    if (added) {
      this.toastService.success(`Added ${product.name} (Size ${inStockVariant.size}) to cart`);
    } else {
      this.toastService.error(`Could not add to cart. Only ${inStockVariant.stock} items left.`);
    }
  }
}
