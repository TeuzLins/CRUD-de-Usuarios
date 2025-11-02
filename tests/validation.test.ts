import { describe, it, expect } from 'vitest';
import { isEmail, validateUserInput } from '../src/core/validation';

describe('validation', () => {
  it('validates email', () => {
    expect(isEmail('foo@bar.com')).toBe(true);
    expect(isEmail('invalid')).toBe(false);
  });

  it('validates user input', () => {
    const ok = validateUserInput({ name: 'John Doe', email: 'john@doe.com', role: 'user' });
    expect(ok.valid).toBe(true);

    const bad = validateUserInput({ name: 'Jo', email: 'nope', role: '' as any });
    expect(bad.valid).toBe(false);
    expect(Object.keys(bad.errors).length).toBeGreaterThan(0);
  });
});