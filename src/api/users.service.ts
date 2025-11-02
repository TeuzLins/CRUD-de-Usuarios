import { request, requestWithMeta } from './client';
import type { User, UserInput, ListParams, Paginated } from '../types';

export async function listUsers(params: ListParams = {}): Promise<Paginated<User>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 5;
  const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';
  const { data, total } = await requestWithMeta<User[]>(`/users?_page=${page}&_limit=${limit}${q}`);
  return { items: data, total: total ?? data.length, page, limit };
}

export async function getUser(id: number): Promise<User> {
  return request<User>(`/users/${id}`);
}

export async function createUser(input: UserInput): Promise<User> {
  const body = JSON.stringify({ ...input, createdAt: new Date().toISOString() });
  return request<User>(`/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
}

export async function updateUser(id: number, input: UserInput): Promise<User> {
  const body = JSON.stringify(input);
  return request<User>(`/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
}

export async function deleteUser(id: number): Promise<void> {
  await request<void>(`/users/${id}`, { method: 'DELETE' });
}