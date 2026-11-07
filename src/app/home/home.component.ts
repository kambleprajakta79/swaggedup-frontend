import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../core/services/product.service';
import { CategoryService } from '../core/services/category.service';
import { BannerService } from '../core/services/banner.service';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../core/services/toast.service';
import { Product } from '../core/models/product.model';
import { Category } from '../core/models/category.model';
import { Banner } from '../core/models/banner.model';
import { ProductCardComponent } from '../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private bannerService = inject(BannerService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  categories: Category[] = [];
  banners: Banner[] = [];
  currentSlide = 0;
  loading = true;

  private autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
  private readonly AUTO_ADVANCE_MS = 5000;

  // Fallback hero used when no banners are configured
  readonly fallbackBanner: Banner = {
    id: 0,
    title: 'DEFINE YOUR STYLE. OWN THE LOOK.',
    subtitle: "Uncompromising quality. Sartorial perfection. Discover the new season's finest cashmere, tailored wool blazers, and handcrafted leather footwear.",
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1600&auto=format&fit=crop',
    link: '/shop',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.stopAutoAdvance();
  }

  loadData() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.slice(0, 5); // Take top 5 categories for home
      },
      error: () => this.toastService.error('Failed to load categories')
    });

    this.bannerService.getActiveBanners().subscribe({
      next: (data) => {
        this.banners = data.length > 0 ? data : [this.fallbackBanner];
        this.startAutoAdvance();
      },
      error: () => {
        this.banners = [this.fallbackBanner];
        this.startAutoAdvance();
      }
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

  // ===== Banner carousel =====

  get activeBanner(): Banner {
    return this.banners[this.currentSlide] || this.banners[0] || this.fallbackBanner;
  }

  goToSlide(index: number) {
    if (this.banners.length === 0) return;
    this.currentSlide = ((index % this.banners.length) + this.banners.length) % this.banners.length;
    this.restartAutoAdvance();
  }

  nextSlide() {
    this.goToSlide(this.currentSlide + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentSlide - 1);
  }

  private startAutoAdvance() {
    if (this.banners.length <= 1 || this.autoAdvanceTimer) return;
    this.autoAdvanceTimer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    }, this.AUTO_ADVANCE_MS);
  }

  private stopAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearInterval(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  private restartAutoAdvance() {
    this.stopAutoAdvance();
    this.startAutoAdvance();
  }

  // Touch swipe support for mobile
  private touchStartX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
    this.stopAutoAdvance();
  }

  onTouchEnd(event: TouchEvent) {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    } else {
      this.startAutoAdvance();
    }
  }

  getBannerImage(banner: Banner): string {
    return banner.image || this.fallbackBanner.image!;
  }

  getBannerLink(banner: Banner): string {
    return banner.link || '/shop';
  }
}
