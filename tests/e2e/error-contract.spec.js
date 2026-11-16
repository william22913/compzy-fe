import { expect, test } from './base';
import {
  chooseRequired,
  registerThroughApi,
  signInThroughUi,
  startCheckout,
  uniqueEmail,
} from './helpers';

// Every code the frontend recognises gets its own dictionary entry in the
// language on screen, and the server's English sentence is never displayed
// (architecture.md "Error contract", REQ-043). Each case is stubbed at the API
// boundary, so the test is about the frontend's rendering, not the backend.

const SERVER_TEXT = 'Server English sentence that must never reach the page';

const CASES = [
  {
    code: 'UNAUTHENTICATED',
    status: 401,
    en: 'Your session has ended.',
    id: 'Sesi Anda telah berakhir.',
  },
  {
    code: 'PART_UNAVAILABLE',
    status: 409,
    en: 'is no longer offered.',
    id: 'tidak tersedia lagi.',
  },
  {
    code: 'TOTAL_CHANGED',
    status: 409,
    details: { total_rupiah: 6030000, items: [] },
    en: 'The prices in your build changed.',
    id: 'Harga dalam rakitan Anda berubah.',
  },
  {
    code: 'BUILD_INCOMPLETE',
    status: 422,
    details: { missing_categories: [{ code: 'psu', name: 'Power Supply' }] },
    en: 'Still empty: Power Supply.',
    id: 'Masih kosong: Catu Daya.',
  },
  {
    code: 'RATE_LIMITED',
    status: 429,
    en: 'Too many attempts.',
    id: 'Terlalu banyak percobaan.',
  },
  {
    code: 'INTERNAL',
    status: 500,
    en: 'We could not place the order.',
    id: 'Kami tidak dapat membuat pesanan.',
    reference: 'e2e-contract-0001',
  },
  {
    code: 'SOMETHING_NEW_FROM_THE_API',
    status: 400,
    en: 'We could not place the order.',
    id: 'Kami tidak dapat membuat pesanan.',
  },
];

async function chooseLanguage(page, lang) {
  if ((page.viewportSize()?.width ?? 1440) <= 1180) {
    await page.locator('.lang__pick select').selectOption(lang);
  } else {
    const label = lang === 'id' ? 'Bahasa Indonesia' : 'English';
    await page.locator('.lang').getByRole('button', { name: label }).click();
  }
}

async function openReview(page, request, baseURL, tag) {
  const email = uniqueEmail(tag);
  await registerThroughApi(request, baseURL, { email });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Processor (CPU)' })).toBeVisible();
  await chooseRequired(page);
  await startCheckout(page);
  await signInThroughUi(page, { email });
  await expect(page).toHaveURL('/order-review');
}

async function stubOrder(page, caseSpec) {
  if (caseSpec.code === 'PART_UNAVAILABLE') {
    const build = JSON.parse(await page.evaluate(() => localStorage.getItem('compzy.build.v1')));
    caseSpec.details = { unavailable_part_ids: [build.cpu] };
  }
  await page.route('**/api/v1/orders', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: caseSpec.status,
          contentType: 'application/json',
          body: JSON.stringify({
            request_id: caseSpec.reference || 'e2e-contract-0000',
            error: { code: caseSpec.code, message: SERVER_TEXT, details: caseSpec.details },
          }),
        })
      : route.continue(),
  );
}

for (const caseSpec of CASES) {
  test(`review: ${caseSpec.code} is rendered from the dictionary, in the language on screen`, async ({
    page,
    request,
    baseURL,
  }) => {
    await openReview(page, request, baseURL, caseSpec.code.toLowerCase());
    await stubOrder(page, caseSpec);
    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByText(caseSpec.en, { exact: false })).toBeVisible();
    if (caseSpec.reference) {
      await expect(page.getByText(`Reference ${caseSpec.reference}`)).toBeVisible();
    }
    await expect(page.getByText(SERVER_TEXT)).toHaveCount(0);

    await chooseLanguage(page, 'id');
    await expect(page.getByText(caseSpec.id, { exact: false })).toBeVisible();
    await expect(page.getByText(SERVER_TEXT)).toHaveCount(0);
  });
}

test('sign-in: a server field code is shown from the dictionary, in the language on screen', async ({
  page,
}) => {
  await page.route('**/api/v1/auth/login', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            request_id: 'e2e-field-0001',
            error: {
              code: 'VALIDATION_FAILED',
              message: SERVER_TEXT,
              fields: [{ field: 'email', code: 'field.email.invalid', message: SERVER_TEXT }],
            },
          }),
        })
      : route.continue(),
  );

  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill('someone@example.com');
  await page.getByLabel('Password').fill('Build1234');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText(SERVER_TEXT)).toHaveCount(0);

  await chooseLanguage(page, 'id');
  await expect(page.getByText('Masukkan alamat email yang valid.')).toBeVisible();
  await expect(page.getByText(SERVER_TEXT)).toHaveCount(0);
});
