// A two-category catalogue: enough for the builder's rules without repeating
// the seeded one.
export const cataloguePayload = {
  request_id: 'test-request-0001',
  data: {
    categories: [
      {
        code: 'cpu',
        name: 'Processor (CPU)',
        required: true,
        parts: [
          { id: '11111111-1111-4111-8111-111111111111', name: 'Intel Core i3-12100F', price_rupiah: 1350000 },
          { id: '11111111-1111-4111-8111-222222222222', name: 'Intel Core i5-12400F', price_rupiah: 2150000 },
        ],
      },
      {
        code: 'ram',
        name: 'RAM',
        required: true,
        parts: [
          { id: '33333333-3333-4333-8333-111111111111', name: 'Kingston Fury 8GB DDR4-3200', price_rupiah: 350000 },
        ],
      },
      {
        code: 'gpu',
        name: 'Graphics Card',
        required: false,
        parts: [
          { id: '22222222-2222-4222-8222-111111111111', name: 'ASUS Dual RTX 3050 8GB', price_rupiah: 3100000 },
        ],
      },
    ],
  },
};

export function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}
