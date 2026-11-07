export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
