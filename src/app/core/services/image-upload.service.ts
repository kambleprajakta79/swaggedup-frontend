import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';

export interface ProcessedImageResult {
  dataUrl: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private maxFileSize = 5 * 1024 * 1024; // 5 MB

  validateFile(file: File): string | null {
    if (!this.allowedTypes.includes(file.type.toLowerCase())) {
      return `File "${file.name}" has an unsupported format. Only JPG, PNG, and WEBP images are allowed.`;
    }
    if (file.size > this.maxFileSize) {
      return `File "${file.name}" exceeds the maximum size of 5MB.`;
    }
    return null;
  }

  processImage(file: File): Observable<ProcessedImageResult> {
    const errorMsg = this.validateFile(file);
    if (errorMsg) {
      return throwError(() => new Error(errorMsg));
    }

    return new Observable<ProcessedImageResult>((observer) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const target = e.target as FileReader;
        const dataUrl = target.result as string;
        
        // Validate MIME type signature directly in Base64 (starts with correct header)
        if (!dataUrl.startsWith('data:image/jpeg;base64,') &&
            !dataUrl.startsWith('data:image/jpg;base64,') &&
            !dataUrl.startsWith('data:image/png;base64,') &&
            !dataUrl.startsWith('data:image/webp;base64,')) {
          observer.error(new Error(`File "${file.name}" has an invalid image signature.`));
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            // Target dimensions
            let width = img.width;
            let height = img.height;
            const maxDim = 1600;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              observer.error(new Error(`Failed to create 2D canvas context for "${file.name}".`));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Compress to WebP (82% quality), or fallback to JPEG
            let compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
            // Check if WebP is supported (if it fell back to image/png, try image/jpeg)
            if (compressedDataUrl.startsWith('data:image/png') && file.type !== 'image/png') {
              compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            }

            // Calculate compressed size in bytes
            const base64Data = compressedDataUrl.split(',')[1];
            const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0;
            const processedSize = (base64Data.length * 3) / 4 - padding;

            observer.next({
              dataUrl: compressedDataUrl,
              originalName: file.name,
              originalSize: file.size,
              processedSize,
            });
            observer.complete();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            observer.error(new Error(`Image compression failed for "${file.name}": ${message}`));
          }
        };

        img.onerror = () => {
          observer.error(new Error(`File "${file.name}" is a corrupt or invalid image.`));
        };

        img.src = dataUrl;
      };

      reader.onerror = () => {
        observer.error(new Error(`Failed to read file "${file.name}".`));
      };

      reader.readAsDataURL(file);
    });
  }

  processMultipleImages(files: FileList | File[]): Observable<ProcessedImageResult[]> {
    const fileList = Array.from(files);
    
    // Check total files size limit before processing (15MB maximum original limit)
    const totalOriginalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 15 * 1024 * 1024; // 15 MB
    
    if (totalOriginalSize > maxTotalSize) {
      return throwError(() => new Error('Total upload size of selected images exceeds the 15MB limit.'));
    }

    const tasks = fileList.map((file) => this.processImage(file));
    return forkJoin(tasks);
  }
}
