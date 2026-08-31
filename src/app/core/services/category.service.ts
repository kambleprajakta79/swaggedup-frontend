import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private api = inject(ApiService);

  getCategories(): Observable<Category[]> {
    return this.api.get<{ categories: Category[] }>('/categories').pipe(
      map(res => res.categories)
    );
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.api.get<{ categories: Category[] }>(`/categories/${slug}`).pipe(
      map(res => res.categories[0])
    );
  }

  // Admin Actions
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.api.post<Category>('/categories', category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.api.patch<Category>(`/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
