import type { UserInput } from '../types';

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateUserInput(input: UserInput): { valid: boolean; errors: Partial<Record<keyof UserInput, string>> } {
  const errors: Partial<Record<keyof UserInput, string>> = {};
  if (!input.name || input.name.trim().length < 3) errors.name = 'Nome deve ter pelo menos 3 caracteres';
  if (!input.email || !isEmail(input.email)) errors.email = 'E-mail inválido';
  if (!input.role) errors.role = 'Selecione uma função';
  return { valid: Object.keys(errors).length === 0, errors };
}