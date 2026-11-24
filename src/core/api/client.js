import { APP_BASE } from '../base';

// The API sits under the same mount as the app: nginx (and the dev server)
// proxy `<mount>/api/` to the service, so a request never leaves the path the
// build is served from.
const API_BASE = new URL('api/v1', APP_BASE).toString();

export class ApiError extends Error {
  constructor(status, body) {
    const error = body && typeof body === 'object' && body.error ? body.error : {};
    super(typeof error.message === 'string' ? error.message : 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.code = typeof error.code === 'string' ? error.code : 'INTERNAL';
    this.fields = Array.isArray(error.fields) ? error.fields : [];
    this.details = error.details && typeof error.details === 'object' ? error.details : {};
    this.requestId = body && typeof body.request_id === 'string' ? body.request_id : null;
  }
}

// One fetch client: same origin, session cookie included, success envelope
// unwrapped, error envelope turned into an ApiError carrying the stable code.
export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') throw error;
    throw new ApiError(0, { error: { code: 'NETWORK' } });
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) throw new ApiError(response.status, payload);
  return payload && typeof payload === 'object' ? payload.data : null;
}
