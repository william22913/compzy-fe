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

export async function register({ fullName, email, password, preferredLanguage }) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: { full_name: fullName, email, password, preferred_language: preferredLanguage },
  });
  return data && data.user ? adaptUser(data.user) : null;
}

// The caller's own account only: the session cookie identifies it, and the
// body carries nothing but the new value.
export async function updateLanguage(preferredLanguage) {
  const data = await apiRequest('/auth/me/language', {
    method: 'PUT',
    body: { preferred_language: preferredLanguage },
  });
  return data && data.user ? adaptUser(data.user) : null;
}

export async function signOut() {
  await apiRequest('/auth/logout', { method: 'POST' });
}
