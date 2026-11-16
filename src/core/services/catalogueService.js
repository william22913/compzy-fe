import { apiRequest } from '../api/client';
import { adaptCategories } from '../api/adapters';

export async function fetchCatalogue({ signal } = {}) {
  const data = await apiRequest('/catalogue', { signal });
  return adaptCategories(data);
}
