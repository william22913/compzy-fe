import { expect } from '@playwright/test';

export const REQUIRED = ['cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'];
export const PASSWORD = 'Build1234';
export const BUILD_KEY = 'compzy.build.v1';

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function chooseFirstOf(page, code) {
  await page
    .locator(`#cat-${code}`)
    .getByRole('button', { name: 'Choose' })
    .first()
    .click();
}

export async function chooseRequired(page) {
  for (const code of REQUIRED) await chooseFirstOf(page, code);
}

export async function openBuildPanel(page) {
  const width = page.viewportSize()?.width ?? 1440;
  if (width < 1000) {
    await page.getByRole('button', { name: 'Your build' }).click();
    await expect(page.locator('#build-panel')).toHaveClass(/is-open/);
  }
}

export async function startCheckout(page) {
  await openBuildPanel(page);
  await page.locator('#build-panel').getByRole('button', { name: 'Checkout' }).click();
}

export async function closeBuildPanel(page) {
  const width = page.viewportSize()?.width ?? 1440;
  if (width >= 1000) return;
  const close = page.getByRole('button', { name: 'Close' });
  if (await close.count()) await close.click();
}

export async function signInThroughUi(page, { email, password = PASSWORD }) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

export async function registerThroughApi(request, baseURL, { email, fullName = 'E2E Buyer' }) {
  const response = await request.post(`${baseURL}/api/v1/auth/register`, {
    data: { full_name: fullName, email, password: PASSWORD },
  });
  expect(response.status()).toBe(201);
}

export function totalText(locator) {
  return locator.locator('.amount').innerText();
}

export function rupiahToNumber(text) {
  return Number(text.replace(/[^0-9]/g, ''));
}
