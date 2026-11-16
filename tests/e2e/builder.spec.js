import { expect, test } from '@playwright/test';
import {
  BUILD_KEY,
  chooseFirstOf,
  chooseRequired,
  closeBuildPanel,
  openBuildPanel,
  rupiahToNumber,
  startCheckout,
} from './helpers';

async function cardPrice(page, code) {
  const card = page.locator(`#cat-${code} .part`).first();
  return rupiahToNumber(await card.locator('.part__price').innerText());
}

function liveTotal(page) {
  const width = page.viewportSize()?.width ?? 1440;
  return width < 1000
    ? page.locator('.build-bar .amount')
    : page.locator('.panel__total .amount');
}

test('lists every category and part from the API with rupiah prices', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await expect(page.locator('.cat')).toHaveCount(7);
  await expect(page.locator('.part')).toHaveCount(21);

  const prices = await page.locator('.part__price').allInnerTexts();
  for (const price of prices) expect(price).toMatch(/^Rp [\d.]+$/);

  await expect(page.locator('.hero__total .amount')).toHaveText('Rp 0');
  await expect(page.locator('#cat-gpu .tag')).toHaveText('Optional');
  await expect(page.locator('#cat-cpu .tag')).toHaveText('Required');
});

test('adds each choice to the total and removes it again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  const cpu = await cardPrice(page, 'cpu');
  await chooseFirstOf(page, 'cpu');
  await expect(page.locator('.hero__total .amount')).toHaveText(
    `Rp ${cpu.toLocaleString('en-US').replaceAll(',', '.')}`,
  );

  const ram = await cardPrice(page, 'ram');
  await chooseFirstOf(page, 'ram');
  const both = cpu + ram;
  const formatted = `Rp ${both.toLocaleString('en-US').replaceAll(',', '.')}`;
  await expect(page.locator('.hero__total .amount')).toHaveText(formatted);
  await expect(liveTotal(page)).toHaveText(formatted);

  await openBuildPanel(page);
  await page
    .locator('#build-panel')
    .getByRole('button', { name: 'Remove' })
    .first()
    .click();
  await expect(page.locator('.hero__total .amount')).toHaveText(
    `Rp ${ram.toLocaleString('en-US').replaceAll(',', '.')}`,
  );
});

test('refuses checkout until every required category has a part, and names the empty ones', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await startCheckout(page);

  await expect(
    page.getByText('Checkout needs one part in every required category.'),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Still empty: Processor (CPU), Motherboard, RAM, Storage (SSD), Power Supply, PC Case.',
    ),
  ).toBeVisible();

  await closeBuildPanel(page);
  await chooseRequired(page);
  await expect(
    page.getByText('Checkout needs one part in every required category.'),
  ).toHaveCount(0);
  await openBuildPanel(page);
  await expect(page.getByText('Every required category is filled.')).toBeVisible();
});

test('keeps the build across a reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await chooseFirstOf(page, 'cpu');
  await chooseFirstOf(page, 'storage');
  const before = await page.locator('.hero__total .amount').innerText();

  await page.reload();
  await expect(page.locator('.hero__total .amount')).toHaveText(before);
  await expect(page.locator('.part__choose[aria-pressed="true"]')).toHaveCount(2);
});

test('drops a saved part the catalogue no longer offers and says which', async ({ page }) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [BUILD_KEY, JSON.stringify({ cpu: '00000000-0000-4000-8000-000000000000' })],
  );

  await page.goto('/');
  await expect(
    page.getByText('The part you chose for Processor (CPU) is no longer offered.'),
  ).toBeVisible();
  await expect(page.locator('.hero__total .amount')).toHaveText('Rp 0');
});

test('shows the catalogue error and loads it again on retry', async ({ page }) => {
  await page.route('**/api/v1/catalogue', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        request_id: 'e2e-0001',
        error: { code: 'INTERNAL', message: 'Something went wrong.' },
      }),
    }),
  );

  await page.goto('/');
  await expect(page.getByText('We could not load the parts catalogue.')).toBeVisible();

  await page.unroute('**/api/v1/catalogue');
  await page.getByRole('button', { name: 'Try again' }).last().click();
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();
  await expect(page.locator('.part')).toHaveCount(21);
});

test('the graphics card is optional', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();

  await chooseRequired(page);
  await openBuildPanel(page);
  await expect(page.locator('#cat-gpu .part__choose[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByText('Every required category is filled.')).toBeVisible();
  await expect(
    page.locator('#build-panel').getByRole('button', { name: 'Checkout' }),
  ).toBeEnabled();
});
