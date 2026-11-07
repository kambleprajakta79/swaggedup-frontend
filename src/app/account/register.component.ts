import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class CustomerRegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  step: 'details' | 'otp' = 'details';
  submitting = false;
  registeredEmail = '';

  detailsForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  otpForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  onRegister() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { name, email, phone, password } = this.detailsForm.value;
    this.authService.register({ name, email, phone, password }).subscribe({
      next: () => {
        this.registeredEmail = email;
        this.step = 'otp';
        this.toast.success('Verification code sent to your email');
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error?.message || 'Registration failed. Try again.');
        this.submitting = false;
      },
    });
  }

  onVerify() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const password = this.detailsForm.value.password;
    this.authService
      .verifyOtp(this.registeredEmail, this.otpForm.value.code, password)
      .subscribe({
        next: () => {
          this.toast.success('Account verified. Welcome to SwaggedUp!');
          this.router.navigate(['/account']);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(err.error?.message || 'Invalid or expired code');
          this.submitting = false;
        },
      });
  }

  onResend() {
    this.submitting = true;
    this.authService.resendOtp(this.registeredEmail).subscribe({
      next: () => {
        this.toast.success('New code sent');
        this.submitting = false;
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(err.error?.message || 'Please wait before requesting a new code');
        this.submitting = false;
      },
    });
  }
}
