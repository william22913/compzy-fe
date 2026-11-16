import { expect, test } from '@playwright/test';
import {
  chooseRequired,
  registerThroughApi,
  signInThroughUi,
  startCheckout,
  uniqueEmail,
} from './helpers';

test('a guest is sent to sign in and returns to the review with the build intact', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('guest');
  await registerThroughApi(request, baseURL, { email });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();
  await chooseRequired(page);
  await startCheckout(page);

  await expect(page).toHaveURL(/\/sign-in\?return=%2Forder-review/);
  await expect(page.getByText('It comes back with you after you sign in.', { exact: false }))
    .toBeVisible();

  await signInThroughUi(page, { email });

  await expect(page).toHaveURL('/order-review');
  await expect(page.locator('.orow')).toHaveCount(6);
  await expect(page.getByText('Final total')).toBeVisible();
});

test('places the order and the confirmation still loads from the API after a reload', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('order');
  await registerThroughApi(request, baseURL, { email });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();
  await chooseRequired(page);
  const total = await page.locator('.hero__total .amount').innerText();

  await startCheckout(page);
  await signInThroughUi(page, { email });
  await expect(page).toHaveURL('/order-review');
  await expect(page.locator('.order-total .amount')).toHaveText(total);

  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page).toHaveURL(/\/order-confirmation\/[0-9a-f-]{36}$/);
  await expect(page.getByText('Order confirmed')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
  await expect(page.locator('.confirm__ref .num')).toHaveText(/^[0-9a-f-]{36}$/);
  await expect(page.locator('.orow')).toHaveCount(6);
  await expect(page.locator('.order-total .amount')).toHaveText(total);
  await expect(page.locator('#build-panel')).toHaveCount(0);

  const confirmationUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(confirmationUrl);
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
  await expect(page.locator('.order-total .amount')).toHaveText(total);

  // The build was cleared when the order went through.
  await page.getByRole('link', { name: 'Start a new build' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.hero__total .amount')).toHaveText('Rp 0');
});

test('the review page says so when there is nothing to review', async ({ page }) => {
  await page.goto('/order-review');

  await expect(page.getByText('Your build is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Choose parts' })).toBeVisible();
});

test('an order that does not exist is reported, not faked', async ({ page }) => {
  await page.goto('/order-confirmation/00000000-0000-4000-8000-000000000000');

  await expect(page.getByText('We could not find that order.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to the builder', exact: true })).toBeVisible();
});
