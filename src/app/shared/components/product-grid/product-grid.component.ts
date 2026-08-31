import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, SkeletonLoaderComponent, EmptyStateComponent],
  templateUrl: './product-grid.component.html',
})
export class ProductGridComponent {
  @Input({ required: true }) products: Product[] = [];
  @Input() loading = false;
  @Output() quickAdd = new EventEmitter<Product>();

  onQuickAdd(product: Product) {
    this.quickAdd.emit(product);
  }
}
