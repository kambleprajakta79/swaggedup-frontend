import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class CustomerLoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  mode: 'login' | 'forgot' = 'login';
  submitting = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private get returnUrl(): string {
    return this.route.snapshot.queryParams['returnUrl'] || '/account';
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error?.message || 'Login failed. Check your credentials.');
        this.submitting = false;
      },
    });
  }

  onForgot() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.authService.requestPasswordReset(this.forgotForm.value.email).subscribe({
      next: () => {
        this.toast.success('If that email exists, a reset code has been sent');
        this.mode = 'login';
        this.submitting = false;
      },
      error: () => {
        this.toast.error('Could not send reset code. Try again.');
        this.submitting = false;
      },
    });
  }
}
