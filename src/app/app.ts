import { Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { WishlistService } from './core/services/wishlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);

  // Merge the local wishlist into the server account once the user logs in.
  // Lives here (root component) to avoid a circular AuthService ↔ WishlistService dependency.
  private userSub: Subscription = this.authService.user$.subscribe((user) => {
    if (user) {
      this.wishlistService.mergeToServer().subscribe();
    }
  });

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
