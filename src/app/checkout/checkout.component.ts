import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../core/services/cart.service';
import { OrderService } from '../core/services/order.service';
import { ToastService } from '../core/services/toast.service';
import { CartItem } from '../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  subtotal = 0;
  shipping = 0;
  total = 0;
  
  currentStep = 1;
  orderPlaced = false;
  placedOrderNumber = '';
  submitting = false;

  ngOnInit() {
    this.cartService.items$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      if (this.cartItems.length === 0 && !this.orderPlaced) {
        this.router.navigate(['/shop']);
      }
      this.calculateTotals();
    });

    this.initForm();
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      // Step 1: Customer Information
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]],

      // Step 2: Shipping
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(5)]],
      country: ['India', [Validators.required]],

      // Step 4: Payment Method
      paymentMethod: ['COD', [Validators.required]]
    });
  }

  private calculateTotals() {
    this.subtotal = this.cartService.getSubtotal();
    this.shipping = this.subtotal >= 5000 || this.subtotal === 0 ? 0 : 150;
    this.total = this.subtotal + this.shipping;
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.isStep1Invalid()) {
        this.checkoutForm.get('customerName')?.markAsTouched();
        this.checkoutForm.get('customerEmail')?.markAsTouched();
        this.checkoutForm.get('customerPhone')?.markAsTouched();
        this.toastService.error('Please fill in valid customer information.');
        return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (this.isStep2Invalid()) {
        this.checkoutForm.get('addressLine1')?.markAsTouched();
        this.checkoutForm.get('city')?.markAsTouched();
        this.checkoutForm.get('state')?.markAsTouched();
        this.checkoutForm.get('postalCode')?.markAsTouched();
        this.toastService.error('Please fill in all required shipping address fields.');
        return;
      }
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Invalid(): boolean {
    return (
      this.checkoutForm.get('customerName')?.invalid ||
      this.checkoutForm.get('customerEmail')?.invalid ||
      this.checkoutForm.get('customerPhone')?.invalid
    ) ?? true;
  }

  isStep2Invalid(): boolean {
    return (
      this.checkoutForm.get('addressLine1')?.invalid ||
      this.checkoutForm.get('city')?.invalid ||
      this.checkoutForm.get('state')?.invalid ||
      this.checkoutForm.get('postalCode')?.invalid ||
      this.checkoutForm.get('country')?.invalid
    ) ?? true;
  }

  submitOrder() {
    if (this.checkoutForm.invalid) {
      this.toastService.error('There are invalid fields in your form.');
      return;
    }

    this.submitting = true;
    const formVal = this.checkoutForm.value;

    const orderPayload = {
      customerName: formVal.customerName,
      customerEmail: formVal.customerEmail,
      customerPhone: formVal.customerPhone,
      addressLine1: formVal.addressLine1,
      addressLine2: formVal.addressLine2,
      city: formVal.city,
      state: formVal.state,
      postalCode: formVal.postalCode,
      country: formVal.country,
      paymentMethod: formVal.paymentMethod,
      subtotal: this.subtotal,
      shippingAmount: this.shipping,
      discountAmount: 0,
      totalAmount: this.total,
      items: this.cartItems.map((item) => ({
        productId: item.product.id,
        productVariantId: item.variant.id,
        quantity: item.quantity,
        price: item.variant.price
      })),
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (res: any) => {
        this.placedOrderNumber = res.orderNumber;
        this.orderPlaced = true;
        this.cartService.clearCart();
        this.toastService.success('Order placed successfully!');
        this.submitting = false;
        // Redirect to order tracking page
        this.router.navigate(['/order', this.placedOrderNumber]);
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'An error occurred while placing your order. Please try again.';
        this.toastService.error(errorMsg);
        this.submitting = false;
      },
    });
  }
}
