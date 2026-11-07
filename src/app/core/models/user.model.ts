export type UserRole = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name?: string | null;
  phone?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
