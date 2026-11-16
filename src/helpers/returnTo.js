// Only the review route may be a post-sign-in destination. Anything else falls
// back to the builder, so a crafted ?return= cannot send a member elsewhere.
const ALLOWED = new Set(['/order-review']);

export function safeReturn(value, fallback = '/') {
  return typeof value === 'string' && ALLOWED.has(value) ? value : fallback;
}

export function signInHref(returnTo) {
  return returnTo && ALLOWED.has(returnTo)
    ? `/sign-in?return=${encodeURIComponent(returnTo)}`
    : '/sign-in';
}

export function signUpHref(returnTo) {
  return returnTo && ALLOWED.has(returnTo)
    ? `/sign-up?return=${encodeURIComponent(returnTo)}`
    : '/sign-up';
}
