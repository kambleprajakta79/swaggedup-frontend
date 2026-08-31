import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest, debounceTime } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent, ProductCardComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  public wishlistService = inject(WishlistService);

  products: Product[] = [];
  categories: Category[] = [];
  
  // Filter states
  searchQuery = '';
  selectedCategory = '';
  minPrice?: number;
  maxPrice?: number;
  selectedSizes: string[] = [];
  sortBy = 'newest';
  page = 1;
  limit = 12;
  totalProducts = 0;
  totalPages = 1;
  showOnlyWishlist = false;
  mobileFiltersOpen = false;
  
  loading = true;

  // Available size options for filtering
  sizeOptions = ['S', 'M', 'L', 'XL', '7', '8', '9', '10', 'One Size'];

  openMobileFilters() {
    this.mobileFiltersOpen = true;
  }

  closeMobileFilters() {
    this.mobileFiltersOpen = false;
  }

  applyMobileFilters() {
    this.applyFilters();
    this.closeMobileFilters();
  }

  resetMobileFilters() {
    this.resetFilters();
    this.closeMobileFilters();
  }

  ngOnInit() {
    this.loadCategories();
    
    // Subscribe to route params and query params to sync state
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(debounceTime(20))
      .subscribe(([params, queryParams]) => {
        this.searchQuery = queryParams['search'] || '';
        this.selectedCategory = params['slug'] || queryParams['category'] || '';
        this.minPrice = queryParams['minPrice'] ? Number(queryParams['minPrice']) : undefined;
        this.maxPrice = queryParams['maxPrice'] ? Number(queryParams['maxPrice']) : undefined;
        this.selectedSizes = queryParams['sizes'] ? queryParams['sizes'].split(',') : [];
        this.sortBy = queryParams['sort'] || 'newest';
        this.page = queryParams['page'] ? Number(queryParams['page']) : 1;
        this.showOnlyWishlist = queryParams['filter'] === 'wishlist';

        this.loadProducts();
      });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: () => this.toastService.error('Failed to load categories'),
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService
      .getProducts({
        search: this.searchQuery || undefined,
        category: this.selectedCategory || undefined,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        sizes: this.selectedSizes,
        sort: this.sortBy,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (res: any) => {
          let list = res.products;
          if (this.showOnlyWishlist) {
            list = list.filter((p: Product) => this.wishlistService.has(p.id));
            this.totalProducts = list.length;
            this.totalPages = 1;
          } else {
            this.totalProducts = res.total;
            this.totalPages = Math.ceil(this.totalProducts / this.limit) || 1;
          }
          this.products = list;
          this.page = res.page;
          this.limit = res.limit;
          this.loading = false;
        },
        error: (err) => {
          console.log('LIST PRODUCTS ERROR:', err);
          this.toastService.error('Failed to retrieve products');
          this.loading = false;
        },
      });
  }

  applyFilters() {
    const queryParams: any = {
      search: this.searchQuery || null,
      category: this.selectedCategory || null,
      minPrice: this.minPrice !== undefined ? this.minPrice : null,
      maxPrice: this.maxPrice !== undefined ? this.maxPrice : null,
      sizes: this.selectedSizes.length > 0 ? this.selectedSizes.join(',') : null,
      sort: this.sortBy || null,
      page: 1, // Reset to first page on filter change
    };

    // If we were on category/:slug route, navigate back to /shop to apply general filters
    if (this.route.snapshot.params['slug']) {
      this.router.navigate(['/shop'], {
        queryParams: { ...queryParams, category: this.selectedCategory }
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) {
      this.selectedSizes.splice(idx, 1);
    } else {
      this.selectedSizes.push(size);
    }
    this.applyFilters();
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge',
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.selectedSizes = [];
    this.sortBy = 'newest';
    this.page = 1;

    if (this.route.snapshot.params['slug']) {
      this.router.navigate(['/shop']);
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          search: null,
          category: null,
          minPrice: null,
          maxPrice: null,
          sizes: null,
          sort: null,
          page: null,
        },
      });
    }
  }

  quickAdd(product: Product) {
    if (!product.variants || product.variants.length === 0) {
      this.toastService.error('Product variants are unavailable');
      return;
    }

    const inStockVariant = product.variants.find((v) => v.stock > 0);
    if (!inStockVariant) {
      this.toastService.error('This product is out of stock in all sizes');
      return;
    }

    const added = this.cartService.addToCart(product, inStockVariant, 1);
    if (added) {
      this.toastService.success(`Added ${product.name} (Size ${inStockVariant.size}) to cart`);
    } else {
      this.toastService.error(`Could not add to cart. Stock is limited.`);
    }
  }
}
