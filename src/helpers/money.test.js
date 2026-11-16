import { describe, expect, it } from 'vitest';
import { formatRupiah } from '../helpers/money';

describe('formatRupiah', () => {
  it('formats zero as Rp 0', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('groups thousands with dots, never commas', () => {
    expect(formatRupiah(350000)).toBe('Rp 350.000');
    expect(formatRupiah(12020000)).toBe('Rp 12.020.000');
    expect(formatRupiah(12500000)).toBe('Rp 12.500.000');
  });

  it('keeps whole rupiah, no decimals', () => {
    expect(formatRupiah(4230000)).toBe('Rp 4.230.000');
  });

  it('shows a dash for a value it cannot format', () => {
    expect(formatRupiah(undefined)).toBe('-');
    expect(formatRupiah('not a price')).toBe('-');
  });
});
