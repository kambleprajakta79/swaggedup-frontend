import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { OrderService } from '../core/services/order.service';
import { WishlistService } from '../core/services/wishlist.service';
import { ToastService } from '../core/services/toast.service';
import { User } from '../core/models/user.model';
import { Order } from '../core/models/order.model';
import { Product } from '../core/models/product.model';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);

  tab: 'profile' | 'orders' | 'wishlist' = 'profile';
  user: User | null = null;
  orders: Order[] = [];
  wishlist: Product[] = [];
  loadingOrders = false;
  loadingWishlist = false;
  savingProfile = false;

  profileForm: FormGroup = this.fb.group({
    name: [''],
    phone: [''],
  });

  ngOnInit() {
    // Open the requested tab via ?tab= query param (e.g. navbar dropdown links)
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam === 'orders' || tabParam === 'wishlist' || tabParam === 'profile') {
      this.tab = tabParam;
    }

    this.authService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({ name: user.name || '', phone: user.phone || '' });
      }
    });
    this.loadOrders();
    this.loadWishlist();
  }

  loadOrders() {
    this.loadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
      },
      error: () => {
        this.loadingOrders = false;
      },
    });
  }

  loadWishlist() {
    this.loadingWishlist = true;
    this.wishlistService.getServerWishlist().subscribe({
      next: (products) => {
        this.wishlist = products;
        this.loadingWishlist = false;
      },
      error: () => {
        this.loadingWishlist = false;
      },
    });
  }

  saveProfile() {
    this.savingProfile = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (updated) => {
        this.toast.success('Profile updated');
        this.savingProfile = false;
      },
      error: () => {
        this.toast.error('Could not update profile');
        this.savingProfile = false;
      },
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromServer(productId).subscribe({
      next: () => {
        this.wishlist = this.wishlist.filter((p) => p.id !== productId);
        this.toast.success('Removed from wishlist');
      },
      error: () => this.toast.error('Could not remove item'),
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  setTab(t: 'profile' | 'orders' | 'wishlist') {
    this.tab = t;
  }
}