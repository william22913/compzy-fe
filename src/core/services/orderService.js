import { apiRequest } from '../api/client';
import { adaptOrder } from '../api/adapters';

export async function placeOrder({ partIds, reviewedTotalRupiah }) {
  const data = await apiRequest('/orders', {
    method: 'POST',
    body: {
      part_ids: partIds,
      reviewed_total_rupiah: reviewedTotalRupiah,
    },
  });
  return data && data.order ? adaptOrder(data.order) : null;
}

export async function fetchOrder(orderId, { signal } = {}) {
  const data = await apiRequest(`/orders/${encodeURIComponent(orderId)}`, { signal });
  return data && data.order ? adaptOrder(data.order) : null;
}
