import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BannerService } from '../../core/services/banner.service';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { ToastService } from '../../core/services/toast.service';
import { Banner } from '../../core/models/banner.model';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './banners.component.html',
})
export class BannersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bannerService = inject(BannerService);
  private imageUploadService = inject(ImageUploadService);
  private toastService = inject(ToastService);

  banners: Banner[] = [];
  loading = true;
  uploading = false;

  // Modal state
  showModal = false;
  editingBanner: Banner | null = null;
  bannerForm!: FormGroup;
  imagePreview: string | null = null;

  private readonly fallbackImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop';

  ngOnInit() {
    this.loadBanners();
    this.initForm();
  }

  loadBanners() {
    this.loading = true;
    this.bannerService.getAllBanners().subscribe({
      next: (data) => {
        this.banners = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load banners');
        this.loading = false;
      }
    });
  }

  private initForm() {
    this.bannerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      subtitle: [''],
      link: [''],
      sortOrder: [0, [Validators.min(0)]],
      isActive: [true],
    });
  }

  openAddModal() {
    this.editingBanner = null;
    this.bannerForm.reset({ title: '', subtitle: '', link: '', sortOrder: this.banners.length + 1, isActive: true });
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(banner: Banner) {
    this.editingBanner = banner;
    this.bannerForm.reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    this.imagePreview = banner.image || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingBanner = null;
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
  }

  toggleActive(banner: Banner, event: Event) {
    event.stopPropagation();
    this.bannerService.updateBanner(banner.id, { isActive: !banner.isActive }).subscribe({
      next: () => {
        banner.isActive = !banner.isActive;
        this.toastService.success(banner.isActive ? 'Banner activated' : 'Banner hidden from site');
      },
      error: () => this.toastService.error('Failed to update banner'),
    });
  }

  deleteBanner(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this banner?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => {
          this.toastService.success('Banner deleted successfully');
          this.loadBanners();
        },
        error: () => this.toastService.error('Failed to delete banner'),
      });
    }
  }

  onSubmit() {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      this.toastService.error('Please correct errors in the form.');
      return;
    }

    const payload: Partial<Banner> = {
      ...this.bannerForm.value,
      image: this.imagePreview || undefined,
    };

    if (this.editingBanner) {
      this.bannerService.updateBanner(this.editingBanner.id, payload).subscribe({
        next: () => {
          this.toastService.success('Banner updated successfully');
          this.closeModal();
          this.loadBanners();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Failed to update banner'),
      });
    } else {
      this.bannerService.createBanner(payload).subscribe({
        next: () => {
          this.toastService.success('Banner created successfully');
          this.closeModal();
          this.loadBanners();
        },
        error: (err) => this.toastService.error(err.error?.message || 'Failed to create banner'),
      });
    }
  }

  getBannerImage(banner: Banner): string {
    return banner.image || this.fallbackImage;
  }
}
