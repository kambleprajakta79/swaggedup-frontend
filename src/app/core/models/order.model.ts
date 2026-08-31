import { OrderStatus } from '../types/order-status.type';
import { PaymentStatus } from '../types/payment-status.type';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  productVariantId: number;
  productName?: string;
  sku?: string;
  size?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
