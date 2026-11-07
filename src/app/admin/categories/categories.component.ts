import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private imageUploadService = inject(ImageUploadService);
  private toastService = inject(ToastService);

  categories: Category[] = [];
  loading = true;
  uploading = false;
  imagePreview: string | null = null;

  // Modal state
  showModal = false;
  editingCategory: Category | null = null;
  categoryForm!: FormGroup;

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load categories');
        this.loading = false;
      }
    });
  }

  private initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      image: ['']
    });
  }

  openAddModal() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.editingCategory = category;
    this.categoryForm.reset({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    this.imagePreview = category.image || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCategory = null;
    this.imagePreview = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploading = true;
    this.imageUploadService.processImage(file).subscribe({
      next: (result) => {
        this.imagePreview = result.dataUrl;
        this.categoryForm.patchValue({ image: result.dataUrl });
        this.uploading = false;
        this.toastService.success('Image ready');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Image processing failed');
        this.uploading = false;
      },
    });
    input.value = '';
  }

  removeImage() {
    this.imagePreview = null;
    this.categoryForm.patchValue({ image: '' });
  }

  deleteCategory(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this category? All associated products may be affected.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.toastService.success('Category deleted successfully');
          this.loadCategories();
        },
        error: () => this.toastService.error('Failed to delete category')
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.toastService.error('Please correct errors in the form.');
      return;
    }

    const payload = this.categoryForm.value;

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, payload).subscribe({
        next: () => {
          this.toastService.success('Category updated successfully');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.toastService.success('Category created successfully');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create category');
        }
      });
    }
  }
}
