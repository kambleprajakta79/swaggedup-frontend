import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private api = inject(ApiService);

  getProducts(query: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<{ products: Product[]; total: number; page: number; limit: number }> {
    let params = new HttpParams();
    
    if (query.search) params = params.set('search', query.search);
    if (query.category) params = params.set('category', query.category);
    if (query.minPrice !== undefined) params = params.set('minPrice', query.minPrice.toString());
    if (query.maxPrice !== undefined) params = params.set('maxPrice', query.maxPrice.toString());
    if (query.sizes && query.sizes.length > 0) params = params.set('sizes', query.sizes.join(','));
    if (query.sort) params = params.set('sort', query.sort);
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.api.get<{ products: Product[]; total: number; page: number; limit: number }>('/products', params);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.api.get<{ products: Product[]; total: number }>(`/products/${slug}`).pipe(
      map(res => res.products[0])
    );
  }

  getFeatured(): Observable<Product[]> {
    return this.api.get<{ products: Product[]; total: number }>('/products/featured').pipe(
      map(res => res.products)
    );
  }

  getNewArrivals(): Observable<Product[]> {
    return this.api.get<{ products: Product[]; total: number }>('/products/new-arrivals').pipe(
      map(res => res.products)
    );
  }

  searchProducts(q: string): Observable<{ products: Product[] }> {
    return this.api.get<{ products: Product[] }>('/products/search', new HttpParams().set('q', q));
  }

  // Admin Actions
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('/products', product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.api.patch<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }
}
