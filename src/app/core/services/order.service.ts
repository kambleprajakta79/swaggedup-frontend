import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Order } from '../models/order.model';
import { OrderStatus } from '../types/order-status.type';
import { PaymentStatus } from '../types/payment-status.type';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private api = inject(ApiService);

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.api.post<Order>('/orders', order);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.api.get<{ orders: Order[] }>(`/orders/${orderNumber}`).pipe(
      map(res => res.orders[0])
    );
  }

  // Admin Actions
  getDashboardStats(): Observable<any> {
    return this.api.get<any>('/admin/orders/dashboard/stats');
  }

  getAllOrders(): Observable<Order[]> {
    return this.api.get<{ orders: Order[] }>('/admin/orders').pipe(
      map(res => res.orders)
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.api.get<{ orders: Order[] }>(`/admin/orders/${id}`).pipe(
      map(res => res.orders[0])
    );
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.api.patch<Order>(`/admin/orders/${id}/status`, { status });
  }

  updateOrderPaymentStatus(id: number, paymentStatus: PaymentStatus): Observable<Order> {
    return this.api.patch<Order>(`/admin/orders/${id}/payment-status`, { paymentStatus });
  }
}
