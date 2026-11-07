import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

// Razorpay Checkout.js global (loaded dynamically from the CDN)
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  private scriptLoaded = false;

  /** Load Razorpay Checkout.js from CDN (once). */
  private loadRazorpayScript(): Promise<void> {
    if (this.scriptLoaded && window.Razorpay) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
      document.body.appendChild(script);
    });
  }

  /**
   * Full online payment flow:
   * 1. Create Razorpay order on the backend
   * 2. Open Razorpay Checkout modal
   * 3. Verify the signature on the backend → order marked PAID
   */
  payOnline(orderId: number, customer: { name: string; email: string; phone: string }): Promise<boolean> {
    return new Promise((resolve) => {
      this.api
        .post<{ razorpayOrderId: string; amount: number; currency: string; keyId: string }>(
          `/payments/create/${orderId}`,
          {},
        )
        .subscribe({
          next: (rp) => {
            this.loadRazorpayScript()
              .then(() => {
                if (!window.Razorpay) {
                  this.toast.error('Payment gateway failed to load');
                  resolve(false);
                  return;
                }
                const rzp = new window.Razorpay({
                  key: rp.keyId,
                  amount: rp.amount,
                  currency: rp.currency,
                  name: 'SwaggedUp Menswear',
                  description: 'Order payment',
                  order_id: rp.razorpayOrderId,
                  prefill: { name: customer.name, email: customer.email, contact: customer.phone },
                  theme: { color: '#D97706' },
                  handler: (response) => {
                    this.api
                      .post<{ success: boolean }>('/payments/verify', {
                        orderId,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                      })
                      .subscribe({
                        next: () => resolve(true),
                        error: () => {
                          this.toast.error('Payment verification failed. Please contact support.');
                          resolve(false);
                        },
                      });
                  },
                  modal: {
                    ondismiss: () => resolve(false),
                  },
                });
                rzp.open();
              })
              .catch(() => {
                this.toast.error('Payment gateway failed to load');
                resolve(false);
              });
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Could not start payment');
            resolve(false);
          },
        });
    });
  }
}
