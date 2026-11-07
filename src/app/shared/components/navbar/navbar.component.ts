import { Component, inject, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnDestroy {
  public cartService = inject(CartService);
  public wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private router = inject(Router);

  searchQuery = '';
  mobileMenuOpen = false;
  profileMenuOpen = false;

  user: User | null = null;
  private userSub: Subscription = this.authService.user$.subscribe((user) => {
    this.user = user;
    if (!user) {
      this.profileMenuOpen = false;
    }
  });

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return !!this.user;
  }

  get isAdmin(): boolean {
    return !!this.user && (this.user.role === 'ADMIN' || this.user.role === 'MANAGER');
  }

  /** First name for the greeting (falls back to email handle). */
  get displayName(): string {
    if (!this.user) return '';
    if (this.user.name) return userFirstName(this.user.name);
    return this.user.email.split('@')[0];
  }

  /** Initials for the avatar circle. */
  get initials(): string {
    if (!this.user) return '';
    const name = this.user.name || this.user.email;
    const parts = name.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  /** Close the profile dropdown when clicking anywhere outside it. */
  @HostListener('document:click')
  onDocumentClick() {
    this.profileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeProfileMenu();
    this.router.navigate(['/']);
  }

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

function userFirstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}
