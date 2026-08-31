import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../core/models/order.model';
import { OrderStatus, ORDER_STATUSES } from '../../core/types/order-status.type';
import { PaymentStatus, PAYMENT_STATUSES } from '../../core/types/payment-status.type';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  orders: Order[] = [];
  loading = true;

  // Modal Detail state
  showModal = false;
  selectedOrder: Order | null = null;
  updatingStatus = false;

  // Status lists for dropdown selects
  orderStatuses = ORDER_STATUSES;
  paymentStatuses = PAYMENT_STATUSES;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load orders list');
        this.loading = false;
      }
    });
  }

  openDetailModal(order: Order) {
    this.selectedOrder = { ...order }; // Clone
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedOrder = null;
  }

  onOrderStatusChange(newStatus: string) {
    if (!this.selectedOrder) return;
    this.updatingStatus = true;
    
    this.orderService.updateOrderStatus(this.selectedOrder.id, newStatus as OrderStatus).subscribe({
      next: (updatedOrder) => {
        this.selectedOrder!.status = updatedOrder.status;
        this.toastService.success(`Order status updated to ${newStatus}`);
        this.loadOrders(); // Refresh background list
        this.updatingStatus = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update order status');
        this.updatingStatus = false;
      }
    });
  }

  onPaymentStatusChange(newPaymentStatus: string) {
    if (!this.selectedOrder) return;
    this.updatingStatus = true;

    this.orderService.updateOrderPaymentStatus(this.selectedOrder.id, newPaymentStatus as PaymentStatus).subscribe({
      next: (updatedOrder) => {
        this.selectedOrder!.paymentStatus = updatedOrder.paymentStatus;
        this.toastService.success(`Payment status updated to ${newPaymentStatus}`);
        this.loadOrders(); // Refresh background list
        this.updatingStatus = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update payment status');
        this.updatingStatus = false;
      }
    });
  }
}
