import { apiRequest } from '../api/client';
import { adaptUser } from '../api/adapters';

export async function fetchCurrentUser({ signal } = {}) {
  const data = await apiRequest('/auth/me', { signal });
  return data && data.user ? adaptUser(data.user) : null;
}

export async function signIn({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return data && data.user ? adaptUser(data.user) : null;
}

export async function register({ fullName, email, password }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: { full_name: fullName, email, password },
  });
  return data && data.user ? adaptUser(data.user) : null;
}

export async function signOut() {
  await apiRequest('/auth/logout', { method: 'POST' });
}
