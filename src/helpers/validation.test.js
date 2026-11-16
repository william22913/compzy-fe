import { describe, expect, it } from 'vitest';
import {
  isEmail,
  isFullName,
  isPassword,
  validateSignIn,
  validateSignUp,
} from './validation';

describe('email rule', () => {
  it('accepts a plain address and trims around it', () => {
    expect(isEmail('buyer1@example.com')).toBe(true);
    expect(isEmail('  buyer1@example.com  ')).toBe(true);
  });

  it('rejects a missing domain, spaces and an over-long address', () => {
    expect(isEmail('buyer1@')).toBe(false);
    expect(isEmail('buy er@example.com')).toBe(false);
    expect(isEmail(`${'a'.repeat(250)}@example.com`)).toBe(false);
  });
});

describe('full name rule', () => {
  it('needs two characters after trimming', () => {
    expect(isFullName('Rina')).toBe(true);
    expect(isFullName(' x ')).toBe(false);
  });

  it('caps the name at 100 characters', () => {
    expect(isFullName('a'.repeat(100))).toBe(true);
    expect(isFullName('a'.repeat(101))).toBe(false);
  });
});

describe('password rule', () => {
  it('needs 8 to 128 characters with a letter and a digit', () => {
    expect(isPassword('Build1234')).toBe(true);
    expect(isPassword('Abcdefg1')).toBe(true);
  });

  it('rejects short, letter-only and digit-only passwords', () => {
    expect(isPassword('compzy')).toBe(false);
    expect(isPassword('abcdefgh')).toBe(false);
    expect(isPassword('12345678')).toBe(false);
    expect(isPassword('A1')).toBe(false);
  });

  it('does not trim: a trailing space is a character', () => {
    expect(isPassword('Build1234 ')).toBe(true);
  });
});

describe('validateSignIn', () => {
  it('reports each empty field by its API key', () => {
    expect(validateSignIn({ email: '', password: '' })).toEqual({
      email: 'field.email.required',
      password: 'field.password.required',
    });
  });

  it('reports a malformed email', () => {
    expect(validateSignIn({ email: 'nope', password: 'Build1234' })).toEqual({
      email: 'field.email.invalid',
    });
  });

  it('passes a filled form', () => {
    expect(validateSignIn({ email: 'buyer1@example.com', password: 'Build1234' })).toEqual({});
  });
});

describe('validateSignUp', () => {
  it('maps every field to the same keys the API uses', () => {
    expect(validateSignUp({ fullName: '', email: '', password: '' })).toEqual({
      fullName: 'field.full_name.required',
      email: 'field.email.required',
      password: 'field.password.required',
    });
  });

  it('reports the password rule, not just presence', () => {
    expect(
      validateSignUp({ fullName: 'Rina Prasetyo', email: 'rina@example.com', password: 'compzy' }),
    ).toEqual({ password: 'field.password.rule' });
  });

  it('passes a valid registration', () => {
    expect(
      validateSignUp({
        fullName: 'Rina Prasetyo',
        email: 'rina@example.com',
        password: 'compzy2026',
      }),
    ).toEqual({});
  });
});
