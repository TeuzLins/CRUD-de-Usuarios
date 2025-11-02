export type Role = 'admin' | 'editor' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: Role;
}

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}