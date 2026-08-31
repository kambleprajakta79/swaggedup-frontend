import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const PRODUCTS_ROUTES: Routes = [
  { path: 'shop', component: ProductListComponent },
  { path: 'shop/:slug', component: ProductDetailComponent },
  { path: 'category/:slug', component: ProductListComponent }
];

export default PRODUCTS_ROUTES;
