export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER'; // or others depending on database
  createdAt: Date | string;
  updatedAt: Date | string;
}
