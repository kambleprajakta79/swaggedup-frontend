import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './order-tracking.component.html',
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  order: Order | null = null;
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const orderNumber = params.get('orderNumber');
      if (orderNumber) {
        this.loadOrder(orderNumber);
      }
    });
  }

  loadOrder(orderNumber: string) {
    this.loading = true;
    this.orderService.getOrderByNumber(orderNumber).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Order not found');
        this.loading = false;
      }
    });
  }

  getStatusStep(status: string): number {
    switch (status) {
      case 'PENDING': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  }
}
