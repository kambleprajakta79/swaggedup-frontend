import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  stats: any = null;
  loading = true;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.orderService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load dashboard metrics');
        this.loading = false;
      }
    });
  }
}
