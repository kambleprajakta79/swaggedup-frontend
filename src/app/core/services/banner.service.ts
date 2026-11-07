import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Banner } from '../models/banner.model';

@Injectable({
  providedIn: 'root',
})
export class BannerService {
  private api = inject(ApiService);

  /** Public: active banners for the homepage carousel. */
  getActiveBanners(): Observable<Banner[]> {
    return this.api.get<Banner[]>('/banners');
  }

  /** Admin: all banners including inactive. */
  getAllBanners(): Observable<Banner[]> {
    return this.api.get<Banner[]>('/banners/all');
  }

  createBanner(banner: Partial<Banner>): Observable<Banner> {
    return this.api.post<Banner>('/banners', banner);
  }

  updateBanner(id: number, banner: Partial<Banner>): Observable<Banner> {
    return this.api.patch<Banner>(`/banners/${id}`, banner);
  }

  deleteBanner(id: number): Observable<void> {
    return this.api.delete<void>(`/banners/${id}`);
  }
}
