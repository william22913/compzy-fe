import { expect, test } from '@playwright/test';
import {
  PASSWORD,
  chooseRequired,
  registerThroughApi,
  signInThroughUi,
  startCheckout,
  uniqueEmail,
} from './helpers';

test('a mistyped address lands on the not-found page', async ({ page }) => {
  await page.goto('/no-such-page');

  await expect(page.getByText('Not found')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to the builder', exact: true }).click();
  await expect(page).toHaveURL('/');
});

test('a name typed into sign-up is rendered as text, not markup', async ({ page }) => {
  const name = '<b>Rina</b> & "friends"';
  const email = uniqueEmail('escape');

  await page.goto('/sign-up');
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();

  await expect(page.locator('.who .name')).toHaveText(name);
  await expect(page.locator('.who .name b')).toHaveCount(0);
});

test('a refused order keeps the build and shows the reference from the API', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('refused');
  await registerThroughApi(request, baseURL, { email });

  await page.route('**/api/v1/orders', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            request_id: 'e2e-ref-0001',
            error: { code: 'INTERNAL', message: 'Something went wrong.' },
          }),
        })
      : route.continue(),
  );

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();
  await chooseRequired(page);
  const total = await page.locator('.hero__total .amount').innerText();

  await startCheckout(page);
  await signInThroughUi(page, { email });
  await expect(page).toHaveURL('/order-review');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText('We could not place the order.')).toBeVisible();
  await expect(page.getByText('Reference e2e-ref-0001')).toBeVisible();
  await expect(page.locator('.order-total .amount')).toHaveText(total);
  await expect(page).toHaveURL('/order-review');
});

test('a phone keeps the build in the bottom bar', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 1000, 'the desktop layout has a panel column');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await page.locator('#cat-cpu .part__choose').first().click();
  const bar = page.locator('.build-bar');
  await expect(bar).toBeVisible();
  const barTotal = await bar.locator('.amount').innerText();
  expect(barTotal).toMatch(/^Rp [\d.]+$/);

  const toggle = page.getByRole('button', { name: 'Your build' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  const close = page.getByRole('button', { name: 'Close' });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#build-panel')).toHaveClass(/is-open/);
  await expect(page.locator('#build-panel .panel__total .amount')).toHaveText(barTotal);

  await close.click();
  await expect(page.locator('#build-panel')).not.toHaveClass(/is-open/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('a desktop shows the build panel and hides the bar', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1000, 'phones use the bottom bar');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await expect(page.locator('.build-bar')).toBeHidden();
  await expect(page.locator('#build-panel')).toBeVisible();
  await expect(page.locator('#build-panel')).toHaveAccessibleName('Your build');
});
