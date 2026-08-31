import { Category } from './category.model';
import { ProductVariant } from './product-variant.model';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  categoryId: number;
  category?: Category;
  brand?: string;
  material?: string;
  color?: string;
  images?: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
