// Only the review route and the confirmation of one order may be a
// post-sign-in destination. Anything else falls back to the builder, so a
// crafted ?return= cannot send a member elsewhere.
const ALLOWED = new Set(['/order-review']);
const CONFIRMATION = /^\/order-confirmation\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function allowed(value) {
  return typeof value === 'string' && (ALLOWED.has(value) || CONFIRMATION.test(value));
}

export function safeReturn(value, fallback = '/') {
  return allowed(value) ? value : fallback;
}

export function signInHref(returnTo) {
  return allowed(returnTo) ? `/sign-in?return=${encodeURIComponent(returnTo)}` : '/sign-in';
}

export function signUpHref(returnTo) {
  return allowed(returnTo) ? `/sign-up?return=${encodeURIComponent(returnTo)}` : '/sign-up';
}
