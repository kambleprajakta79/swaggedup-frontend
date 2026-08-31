export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  size: string;
  price: number;
  stock: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
