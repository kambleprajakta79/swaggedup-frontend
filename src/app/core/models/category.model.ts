import { Product } from './product.model';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products?: Product[];
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
