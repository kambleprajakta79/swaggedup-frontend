import { Routes } from '@angular/router';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';

export const ORDERS_ROUTES: Routes = [
  { path: ':orderNumber', component: OrderTrackingComponent }
];

export default ORDERS_ROUTES;
