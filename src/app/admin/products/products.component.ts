import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ImageUploadService, ProcessedImageResult } from '../../core/services/image-upload.service';

interface EditableVariant {
  id?: number;
  size: string;
  sku: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './products.component.html',
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private imageUploadService = inject(ImageUploadService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;

  // Modal State
  showModal = false;
  editingProduct: Product | null = null; // null if adding new product
  productForm!: FormGroup;
  variants: EditableVariant[] = [];
  uploadedImages: string[] = [];
  processingImages = false;

  // New Variant Form input values
  newSize = '';
  newSku = '';
  newPrice?: number;
  newStock?: number;

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.initForm();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts({ limit: 100 }).subscribe({
      next: (res: any) => {
        this.products = res.products;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load products list');
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => this.categories = data,
      error: () => this.toastService.error('Failed to load categories list')
    });
  }

  private initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      brand: ['SWAGGER & CO'],
      material: [''],
      color: [''],
      isFeatured: [false],
      isNewArrival: [false],
      isActive: [true],
      isCustomizable: [false],
      customizationNote: ['']
    });
  }

  openAddModal() {
    this.editingProduct = null;
    this.variants = [];
    this.uploadedImages = [];
    this.productForm.reset({
      brand: 'SWAGGER & CO',
      basePrice: 0,
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isCustomizable: false,
      customizationNote: ''
    });
    this.clearNewVariantInputs();
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.variants = product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      sku: v.sku,
      price: Number(v.price),
      stock: Number(v.stock)
    }));
    this.uploadedImages = [...(product.images || [])];
    
    this.productForm.reset({
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      categoryId: product.categoryId,
      brand: product.brand,
      material: product.material,
      color: product.color,
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
      isActive: !!product.isActive,
      isCustomizable: !!product.isCustomizable,
      customizationNote: product.customizationNote || ''
    });
    this.clearNewVariantInputs();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.variants = [];
    this.uploadedImages = [];
  }

  // Variant manager
  addVariant() {
    if (!this.newSize || !this.newSku || this.newPrice === undefined || this.newStock === undefined) {
      this.toastService.error('Please fill in all variant fields (Size, SKU, Price, Stock)');
      return;
    }

    // Check SKU unique in form
    if (this.variants.some((v) => v.sku.toUpperCase() === this.newSku.toUpperCase())) {
      this.toastService.error('Variant SKU already exists in this form.');
      return;
    }

    this.variants.push({
      size: this.newSize.toUpperCase(),
      sku: this.newSku.toUpperCase(),
      price: this.newPrice,
      stock: this.newStock
    });

    this.clearNewVariantInputs();
  }

  removeVariant(idx: number) {
    this.variants.splice(idx, 1);
  }

  private clearNewVariantInputs() {
    this.newSize = '';
    this.newSku = '';
    this.newPrice = undefined;
    this.newStock = undefined;
  }

  sumStock(product: Product): number {
    if (!product.variants) return 0;
    return product.variants.reduce((sum: number, v) => sum + Number(v.stock), 0);
  }

  toggleActive(product: Product, event: Event) {
    event.stopPropagation();
    const updatedStatus = !product.isActive;
    this.productService.updateProduct(product.id, { isActive: updatedStatus }).subscribe({
      next: () => {
        product.isActive = updatedStatus;
        this.toastService.success(`Product ${updatedStatus ? 'activated' : 'deactivated'}`);
      },
      error: (err: any) => this.toastService.error('Failed to change product status')
    });
  }

  deleteProduct(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastService.success('Product deleted successfully');
          this.loadProducts();
        },
        error: (err: any) => this.toastService.error('Failed to delete product')
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Max 5 images limit
    const totalCount = this.uploadedImages.length + input.files.length;
    if (totalCount > 5) {
      this.toastService.error('Maximum 5 images are allowed per product.');
      return;
    }

    this.processingImages = true;
    this.imageUploadService.processMultipleImages(input.files).subscribe({
      next: (results: ProcessedImageResult[]) => {
        results.forEach((res) => {
          this.uploadedImages.push(res.dataUrl);
        });
        this.processingImages = false;
        input.value = '';
      },
      error: (err: Error) => {
        this.toastService.error(err.message || 'Image processing failed');
        this.processingImages = false;
        input.value = '';
      }
    });
  }

  removeUploadedImage(idx: number) {
    this.uploadedImages.splice(idx, 1);
  }

  moveUploadedImage(idx: number, direction: 'left' | 'right') {
    if (direction === 'left' && idx > 0) {
      const temp = this.uploadedImages[idx];
      this.uploadedImages[idx] = this.uploadedImages[idx - 1];
      this.uploadedImages[idx - 1] = temp;
    } else if (direction === 'right' && idx < this.uploadedImages.length - 1) {
      const temp = this.uploadedImages[idx];
      this.uploadedImages[idx] = this.uploadedImages[idx + 1];
      this.uploadedImages[idx + 1] = temp;
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toastService.error('Please correct errors in the form.');
      return;
    }

    if (this.variants.length === 0) {
      this.toastService.error('Please add at least one product size variant.');
      return;
    }

    if (this.uploadedImages.length === 0) {
      this.toastService.error('Please upload at least one product image.');
      return;
    }

    const formVal = this.productForm.value;

    const payload = {
      name: formVal.name,
      description: formVal.description,
      basePrice: Number(formVal.basePrice),
      categoryId: Number(formVal.categoryId),
      brand: formVal.brand,
      material: formVal.material,
      color: formVal.color,
      images: this.uploadedImages,
      isFeatured: !!formVal.isFeatured,
      isNewArrival: !!formVal.isNewArrival,
      isActive: !!formVal.isActive,
      isCustomizable: !!formVal.isCustomizable,
      customizationNote: formVal.isCustomizable ? (formVal.customizationNote || '') : null,
      variants: this.variants as any
    };

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, payload).subscribe({
        next: () => {
          this.toastService.success('Product updated successfully');
          this.closeModal();
          this.loadProducts();
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Failed to update product';
          this.toastService.error(msg);
        }
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => {
          this.toastService.success('Product created successfully');
          this.closeModal();
          this.loadProducts();
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Failed to create product';
          this.toastService.error(msg);
        }
      });
    }
  }
}
