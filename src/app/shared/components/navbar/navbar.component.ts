import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  private router = inject(Router);

  searchQuery = '';
  mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  triggerSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
      this.mobileMenuOpen = false;
    }
  }
}
