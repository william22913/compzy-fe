import { expect, test } from './base';
import { PASSWORD, registerThroughApi, signInThroughUi, uniqueEmail } from './helpers';

test('sign-in shows its own errors before it calls the API', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Enter your email address.')).toBeVisible();
  await expect(page.getByText('Enter a password.')).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in/);
});

test('sign-in rejects credentials that do not match', async ({ page }) => {
  await page.goto('/sign-in');

  await signInThroughUi(page, { email: uniqueEmail('nobody') });

  await expect(
    page.getByText('The email address or password is not correct.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in/);
});

test('sign-up creates the account and lands signed in', async ({ page }) => {
  const email = uniqueEmail('signup');

  await page.goto('/sign-up');
  await page.getByLabel('Full name').fill('Rina Prasetyo');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();

  await expect(page).toHaveURL('/');
  // The design hides the name in the header on a phone; it is still rendered.
  await expect(page.locator('.who .name')).toHaveText('Rina Prasetyo');
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  // On a phone the design keeps one header action; review is reached on checkout.
  if ((page.viewportSize()?.width ?? 1440) > 720) {
    await expect(page.getByRole('link', { name: 'Order review' })).toBeVisible();
  }
});

test('sign-up refuses an email that already has an account', async ({ page, request, baseURL }) => {
  const email = uniqueEmail('dupe');
  await registerThroughApi(request, baseURL, { email });

  await page.goto('/sign-up');
  await page.getByLabel('Full name').fill('Second Buyer');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();

  await expect(page.getByText('This email address already has an account.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in instead' })).toBeVisible();
});

test('sign-up enforces the password rule', async ({ page }) => {
  await page.goto('/sign-up');
  await page.getByLabel('Full name').fill('Rina Prasetyo');
  await page.getByLabel('Email address').fill(uniqueEmail('weak'));
  await page.getByLabel('Password').fill('abcdefgh');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();

  await expect(
    page.getByText('Use 8 to 128 characters, with at least one letter and one number.'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/sign-up/);
});

test('an ended session is explained on the sign-in page', async ({ page }) => {
  await page.goto('/sign-in?return=%2Forder-review&expired=1');

  await expect(page.getByText('Your session has ended.')).toBeVisible();
  await expect(
    page.getByText('Sign in again to finish this order.', { exact: false }),
  ).toBeVisible();
});

test('signing out returns you to the builder as a guest', async ({ page, request, baseURL }) => {
  const email = uniqueEmail('signout');
  await registerThroughApi(request, baseURL, { email });

  await page.goto('/sign-in');
  await signInThroughUi(page, { email });
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('You are signed out.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in' }).first()).toBeVisible();
});

test('a crafted return path lands on the builder, not somewhere else', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('redirect');
  await registerThroughApi(request, baseURL, { email });

  await page.goto('/sign-in?return=%2F%2Fevil.example');
  await signInThroughUi(page, { email });

  await expect(page).toHaveURL('/');
  await expect(page).not.toHaveURL(/evil\.example/);
});
