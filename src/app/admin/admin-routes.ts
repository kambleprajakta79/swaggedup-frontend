import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { AdminProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { AdminOrdersComponent } from './orders/orders.component';
import { InventoryComponent } from './inventory/inventory.component';
import { BannersComponent } from './banners/banners.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'products', component: AdminProductsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'banners', component: BannersComponent },
  { path: 'orders', component: AdminOrdersComponent },
  { path: 'inventory', component: InventoryComponent }
];

export default ADMIN_ROUTES;
