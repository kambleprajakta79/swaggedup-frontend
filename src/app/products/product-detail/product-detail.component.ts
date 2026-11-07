import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductVariant } from '../../core/models/product-variant.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  product: Product | null = null;
  selectedImage = '';
  selectedVariant: ProductVariant | null = null;
  quantity = 1;
  relatedProducts: Product[] = [];
  loading = true;

  /** WhatsApp business number for click-to-chat (country code, no +). */
  private readonly whatsappNumber = '919876543210'; // TODO: move to environment config

  /** wa.me deep link with a prefilled customization inquiry for this product. */
  get whatsappCustomizeLink(): string {
    const name = this.product?.name || 'this product';
    const text = encodeURIComponent(
      `Hi SwaggedUp! I'm interested in a custom print on "${name}". Can you help me design it?`
    );
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  }

  ngOnInit() {
    // Subscribe to route parameter changes to reload when clicking related products
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.loading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (data) => {
        this.product = data;
        this.selectedImage = this.product.images?.[0] || '';
        
        // Reset selections
        this.selectedVariant = null;
        this.quantity = 1;
        
        this.loadRelatedProducts();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Product not found');
        this.router.navigate(['/shop']);
        this.loading = false;
      },
    });
  }

  loadRelatedProducts() {
    if (!this.product || !this.product.category) return;

    this.productService.getProducts({
      category: this.product.category.slug,
      limit: 5 // Fetch 5 to filter out the current product and still get up to 4 related
    }).subscribe({
      next: (res) => {
        this.relatedProducts = res.products.filter((p) => p.id !== this.product!.id).slice(0, 4);
      }
    });
  }

  selectVariant(variant: ProductVariant) {
    if (variant.stock === 0) return; // Cannot select out of stock sizes
    this.selectedVariant = variant;
    this.quantity = 1; // Reset quantity to 1 when changing variant
  }

  changeQuantity(change: number) {
    if (!this.selectedVariant) return;
    
    const newQty = this.quantity + change;
    if (newQty < 1) return;
    if (newQty > this.selectedVariant.stock) {
      this.toastService.info(`Only ${this.selectedVariant.stock} items available in this size.`);
      return;
    }
    this.quantity = newQty;
  }

  addToCart() {
    if (!this.product || !this.selectedVariant) {
      this.toastService.error('Please select a size first.');
      return;
    }

    const added = this.cartService.addToCart(this.product, this.selectedVariant, this.quantity);
    if (added) {
      this.toastService.success(`Added ${this.product.name} (Size ${this.selectedVariant.size}) to cart`);
    } else {
      this.toastService.error(`Could not add items to cart. Stock is limited.`);
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

  buyNow() {
    if (!this.product || !this.selectedVariant) {
      this.toastService.error('Please select a size first.');
      return;
    }

    const added = this.cartService.addToCart(this.product, this.selectedVariant, this.quantity);
    if (added) {
      this.cartService.closeCart();
      this.router.navigate(['/checkout']);
    } else {
      this.toastService.error('Could not add items. Stock is limited.');
    }
  }
}
