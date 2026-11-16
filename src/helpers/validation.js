// Client-side checks mirror the API's field rules and return the API's field
// keys, so an error message is looked up the same way either way.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  const email = String(value ?? '').trim();
  return email.length > 0 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function isFullName(value) {
  const name = String(value ?? '').trim();
  return name.length >= 2 && name.length <= 100;
}

export function isPassword(value) {
  const password = String(value ?? '');
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

export function validateSignIn({ email, password }) {
  const errors = {};
  if (!String(email ?? '').trim()) errors.email = 'field.email.required';
  else if (!isEmail(email)) errors.email = 'field.email.invalid';
  if (!String(password ?? '')) errors.password = 'field.password.required';
  return errors;
}

export function validateSignUp({ fullName, email, password }) {
  const errors = {};
  const name = String(fullName ?? '').trim();
  if (!name) errors.fullName = 'field.full_name.required';
  else if (!isFullName(name)) errors.fullName = 'field.full_name.length';

  if (!String(email ?? '').trim()) errors.email = 'field.email.required';
  else if (!isEmail(email)) errors.email = 'field.email.invalid';

  if (!String(password ?? '')) errors.password = 'field.password.required';
  else if (!isPassword(password)) errors.password = 'field.password.rule';

  return errors;
}
