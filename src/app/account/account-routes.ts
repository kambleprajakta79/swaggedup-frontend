import { Routes } from '@angular/router';
import { AccountComponent } from './account.component';
import { customerGuard } from '../core/guards/role.guards';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', component: AccountComponent, canActivate: [customerGuard] },
];
