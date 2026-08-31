import { Routes } from '@angular/router';
import { StorefrontLayoutComponent } from './layout/storefront-layout/storefront-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './admin/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public Client Storefront Layout
  {
    path: '',
    component: StorefrontLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./home/home-routes').then((m) => m.HOME_ROUTES)
      },
      {
        path: '',
        loadChildren: () => import('./products/products-routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'cart',
        loadChildren: () => import('./cart/cart-routes').then((m) => m.CART_ROUTES)
      },
      {
        path: 'checkout',
        loadChildren: () => import('./checkout/checkout-routes').then((m) => m.CHECKOUT_ROUTES)
      },
      {
        path: 'order',
        loadChildren: () => import('./orders/orders-routes').then((m) => m.ORDERS_ROUTES)
      }
    ]
  },

  // Admin Login (Standalone page, no sidebar layout)
  { 
    path: 'admin/login', 
    component: AdminLoginComponent,
    canActivate: [guestGuard]
  },

  // Admin Portal Layout (Sidebar layout)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin-routes').then((m) => m.ADMIN_ROUTES)
  },

  // Fallback redirect
  { path: '**', redirectTo: '' }
];
