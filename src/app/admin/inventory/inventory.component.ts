import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

interface InventoryRow {
  productId: number;
  productName: string;
  productSlug: string;
  categoryName: string;
  sku: string;
  size: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  categories: Category[] = [];
  inventoryRows: InventoryRow[] = [];
  filteredRows: InventoryRow[] = [];
  loading = true;

  // Search & Filter state
  searchQuery = '';
  selectedCategory = '';
  showLowStockOnly = false;

  ngOnInit() {
    this.loadCategories();
    this.loadInventory();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: () => this.toastService.error('Failed to load categories')
    });
  }

  loadInventory() {
    this.loading = true;
    this.productService.getProducts({ limit: 200 }).subscribe({
      next: (res: any) => {
        this.products = res.products;
        this.buildInventoryRows();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load inventory data');
        this.loading = false;
      }
    });
  }

  private buildInventoryRows() {
    const rows: InventoryRow[] = [];
    this.products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          rows.push({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            categoryName: product.category?.name || 'Uncategorized',
            sku: variant.sku,
            size: variant.size,
            price: variant.price,
            stock: variant.stock
          });
        });
      }
    });
    this.inventoryRows = rows;
    this.applyFilters();
  }

  applyFilters() {
    let rows = [...this.inventoryRows];

    // Search query filter (matches SKU or product name)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      rows = rows.filter(
        (r) => r.productName.toLowerCase().includes(query) || r.sku.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      rows = rows.filter((r) => r.categoryName === this.selectedCategory);
    }

    // Low stock filter (threshold of 5 items or fewer)
    if (this.showLowStockOnly) {
      rows = rows.filter((r) => r.stock <= 5);
    }

    this.filteredRows = rows;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.showLowStockOnly = false;
    this.applyFilters();
  }
}
