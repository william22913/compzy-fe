import { describe, expect, it } from 'vitest';
import { adaptCategories, adaptOrder, adaptUser } from './adapters';
import { cataloguePayload } from '../../test/fixtures';

describe('adaptCategories', () => {
  it('maps the wire shape to camelCase and keeps prices as integers', () => {
    const categories = adaptCategories(cataloguePayload.data);
    expect(categories[0]).toEqual({
      code: 'cpu',
      name: 'Processor (CPU)',
      required: true,
      parts: [
        { id: '11111111-1111-4111-8111-111111111111', name: 'Intel Core i3-12100F', priceRupiah: 1350000 },
        { id: '11111111-1111-4111-8111-222222222222', name: 'Intel Core i5-12400F', priceRupiah: 2150000 },
      ],
    });
    expect(categories.find((category) => category.code === 'gpu').required).toBe(false);
  });

  it('survives a payload with no categories', () => {
    expect(adaptCategories(null)).toEqual([]);
    expect(adaptCategories({})).toEqual([]);
  });
});

describe('adaptUser', () => {
  it('maps full_name to fullName and passes the language through', () => {
    expect(
      adaptUser({
        id: 'u1',
        full_name: 'Rina Prasetyo',
        email: 'rina@example.com',
        preferred_language: 'en',
      }),
    ).toEqual({
      id: 'u1',
      fullName: 'Rina Prasetyo',
      email: 'rina@example.com',
      preferredLanguage: 'en',
    });
  });

  it('reads a missing or unexpected language as Indonesian', () => {
    const base = { id: 'u1', full_name: 'Rina', email: 'rina@example.com' };
    expect(adaptUser(base).preferredLanguage).toBe('id');
    expect(adaptUser({ ...base, preferred_language: 'fr' }).preferredLanguage).toBe('id');
    expect(adaptUser({ ...base, preferred_language: 'EN' }).preferredLanguage).toBe('id');
  });
});

describe('adaptOrder', () => {
  it('maps the order and its items', () => {
    expect(
      adaptOrder({
        id: 'o1',
        total_rupiah: 4230000,
        created_at: '2026-11-16T06:30:00Z',
        items: [
          {
            category_code: 'cpu',
            category_name: 'Processor (CPU)',
            part_name: 'Intel Core i3-12100F',
            unit_price_rupiah: 1350000,
          },
        ],
      }),
    ).toEqual({
      id: 'o1',
      totalRupiah: 4230000,
      createdAt: '2026-11-16T06:30:00Z',
      items: [
        {
          categoryCode: 'cpu',
          categoryName: 'Processor (CPU)',
          partName: 'Intel Core i3-12100F',
          unitPriceRupiah: 1350000,
        },
      ],
    });
  });
});
