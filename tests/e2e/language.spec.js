import { expect, test } from '@playwright/test';
import { PASSWORD, registerThroughApi, uniqueEmail } from './helpers';

// Every context in this file claims English as the browser's own language:
// the app must never use it to pick one (REQ-044, TC-069).
test.use({ locale: 'en-US' });

const STORAGE_KEY = 'compzy.lang.v1';
const LABELS = { en: 'English', id: 'Bahasa Indonesia' };
const REQUIRED = ['cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'];

// The strings these journeys assert, read straight from the two dictionaries.
const T = {
  en: {
    cpu: 'Processor (CPU)',
    motherboard: 'Motherboard',
    ram: 'RAM',
    storage: 'Storage (SSD)',
    gpu: 'Graphics Card',
    psu: 'Power Supply',
    case: 'PC Case',
    totalSoFar: 'Total so far',
    startChoosing: 'Start choosing',
    choose: 'Choose',
    remove: 'Remove',
    panel: 'Your build',
    close: 'Close',
    checkout: 'Checkout',
    tryAgain: 'Try again',
    loadingCatalogue: 'Loading the parts catalogue',
    loadError: 'We could not load the parts catalogue.',
    need: 'Still needed: Processor (CPU), Motherboard, Storage (SSD), Power Supply, PC Case.',
    needAll: 'Checkout needs one part in every required category.',
    stillEmpty:
      'Still empty: Processor (CPU), Motherboard, Storage (SSD), Power Supply, PC Case. The graphics card is optional.',
    signOut: 'Sign out',
    email: 'Email address',
    password: 'Password',
    fullName: 'Full name',
    createAccount: 'Create account',
    signIn: 'Sign in',
    welcome: 'Welcome back',
    placeOrder: 'Place order',
    finalTotal: 'Final total',
    confirmTitle: 'Order placed',
    confirmLoading: 'Loading your order',
    emptyReview: 'Your build is empty.',
    emptyField: 'Enter your email address.',
    wrongPassword: 'The email address or password is not correct.',
    duplicate: 'This email address already has an account.',
    notFoundTitle: 'This page is not here',
    title: 'compzy · PC Builder',
  },
  id: {
    cpu: 'Prosesor (CPU)',
    motherboard: 'Papan Induk',
    ram: 'RAM',
    storage: 'Penyimpanan (SSD)',
    gpu: 'Kartu Grafis',
    psu: 'Catu Daya',
    case: 'Casing PC',
    totalSoFar: 'Total sejauh ini',
    startChoosing: 'Mulai memilih',
    choose: 'Pilih',
    remove: 'Hapus',
    panel: 'Rakitan Anda',
    close: 'Tutup',
    checkout: 'Lanjut ke pemesanan',
    tryAgain: 'Coba lagi',
    loadingCatalogue: 'Memuat katalog komponen',
    loadError: 'Kami tidak dapat memuat katalog komponen.',
    need: 'Masih perlu: Prosesor (CPU), Papan Induk, Penyimpanan (SSD), Catu Daya, Casing PC.',
    needAll: 'Untuk melanjutkan pemesanan, setiap kategori wajib berisi satu komponen.',
    stillEmpty:
      'Masih kosong: Prosesor (CPU), Papan Induk, Penyimpanan (SSD), Catu Daya, Casing PC. Kartu grafis opsional.',
    signOut: 'Keluar',
    email: 'Alamat email',
    password: 'Kata sandi',
    fullName: 'Nama lengkap',
    createAccount: 'Buat akun',
    signIn: 'Masuk',
    welcome: 'Selamat datang kembali',
    placeOrder: 'Buat pesanan',
    finalTotal: 'Total akhir',
    confirmTitle: 'Pesanan dibuat',
    confirmLoading: 'Memuat pesanan Anda',
    emptyReview: 'Rakitan Anda kosong.',
    emptyField: 'Masukkan alamat email Anda.',
    wrongPassword: 'Alamat email atau kata sandi tidak benar.',
    duplicate: 'Alamat email ini sudah memiliki akun.',
    notFoundTitle: 'Halaman ini tidak ada',
    title: 'compzy · Perakit PC',
  },
};

function narrowHeader(page) {
  return (page.viewportSize()?.width ?? 1440) <= 1180;
}

function phone(page) {
  return (page.viewportSize()?.width ?? 1440) < 1000;
}

// Two labelled choices on a wide header, the same two inside the picker where
// the header is narrow. Both must be there, and show which one is in use.
async function expectSwitcher(page, lang) {
  if (narrowHeader(page)) {
    const select = page.locator('.lang__pick select');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toHaveCount(2);
    await expect(select.locator('option')).toHaveText([LABELS.id, LABELS.en]);
    await expect(select).toHaveValue(lang);
  } else {
    const en = page.getByRole('button', { name: LABELS.en, exact: true });
    const id = page.getByRole('button', { name: LABELS.id, exact: true });
    await expect(en).toBeVisible();
    await expect(id).toBeVisible();
    await expect(page.locator('.lang__opt')).toHaveCount(2);
    await expect(en).toHaveAttribute('aria-pressed', String(lang === 'en'));
    await expect(id).toHaveAttribute('aria-pressed', String(lang === 'id'));
  }
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

async function chooseLanguage(page, lang) {
  if (narrowHeader(page)) {
    await page.locator('.lang__pick select').selectOption(lang);
  } else {
    await page.getByRole('button', { name: LABELS[lang], exact: true }).click();
  }
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

async function chooseFirst(page, lang, code) {
  await page
    .locator(`#cat-${code}`)
    .getByRole('button', { name: T[lang].choose })
    .first()
    .click();
}

async function chooseRequired(page, lang) {
  for (const code of REQUIRED) await chooseFirst(page, lang, code);
}

async function openPanel(page, lang) {
  if (!phone(page)) return;
  await page.getByRole('button', { name: T[lang].panel }).click();
  await expect(page.locator('#build-panel')).toHaveClass(/is-open/);
}

async function closePanel(page, lang) {
  if (!phone(page)) return;
  const close = page.getByRole('button', { name: T[lang].close });
  if (await close.count()) await close.click();
}

async function startCheckout(page, lang) {
  await openPanel(page, lang);
  await page.locator('#build-panel').getByRole('button', { name: T[lang].checkout }).click();
}

async function signIn(page, lang, email) {
  await page.getByLabel(T[lang].email).fill(email);
  await page.getByLabel(T[lang].password).fill(PASSWORD);
  await page.getByRole('button', { name: T[lang].signIn }).click();
}

async function createAccount(page, lang, { fullName, email }) {
  await page.getByLabel(T[lang].fullName).fill(fullName);
  await page.getByLabel(T[lang].email).fill(email);
  await page.getByLabel(T[lang].password).fill(PASSWORD);
  await page.getByRole('button', { name: T[lang].createAccount }).click();
}

// No raw translation key, no blank control: every visible piece of text is a
// real string in the language on screen (TC-091).
async function expectNoRawKeys(page) {
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(
    /\b(?:builder|auth|chrome|review|confirmation|notFound|meta|language|categories)\.[a-zA-Z_.]+\b/,
  );
  expect(text).not.toMatch(/\bfield\.[a-z_.]+\b/);
  const blank = await page
    .locator('h1, h2, h3, .btn, .part__choose, .field__label, nav a')
    .evaluateAll(
      (nodes) =>
        nodes.filter((node) => node.offsetParent !== null && !node.textContent.trim()).length,
    );
  expect(blank).toBe(0);
}

async function snapshot(page) {
  return {
    heads: await page.locator('.cat__title').allInnerTexts(),
    total: await page.locator('.hero__total .amount').innerText(),
    names: await page.locator('.part__name').allInnerTexts(),
    labels: await page.locator('.part__lot').allInnerTexts(),
  };
}

test('TC-069 a first visit is Indonesian, and the browser language changes nothing', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  for (const code of ['motherboard', 'ram', 'storage', 'gpu', 'psu', 'case']) {
    await expect(page.locator(`#cat-${code} .cat__title`)).toHaveText(T.id[code]);
  }
  await expect(page.locator('.hero__total .label')).toHaveText(T.id.totalSoFar);
  await expect(page.locator('.hero__total .amount')).toHaveText('Rp 0');
  await expect(page.getByRole('button', { name: T.id.startChoosing })).toBeVisible();
  await expectSwitcher(page, 'id');
  await expect(page).toHaveTitle(T.id.title);
  // Product names and rupiah amounts are the same in both languages.
  await expect(page.locator('#cat-cpu').getByText('Intel Core i5-12400F')).toBeVisible();
  await expect(page.locator('#cat-cpu .part__price').first()).toHaveText(/^Rp [\d.]+$/);

  await page.reload();
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await expectSwitcher(page, 'id');

  // A browser that prefers Indonesian does not change the answer either way.
  const indonesian = await browser.newContext({ baseURL, locale: 'id-ID' });
  const other = await indonesian.newPage();
  await other.goto('/');
  await expect(other.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await indonesian.close();
});

test('TC-070 the two-choice switcher is on every page a visitor can reach', async ({ page }) => {
  for (const path of ['/', '/sign-in', '/sign-up', '/no-such-page']) {
    await page.goto(path);
    await expect(page.locator('.hdr .brand')).toBeVisible();
    await expectSwitcher(page, 'id');
  }
});

test('TC-073 the switcher is visible and usable on a phone', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) > 1180, 'the wide header shows two buttons');

  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await expectSwitcher(page, 'id');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);

  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await expectSwitcher(page, 'en');

  await page.goto('/sign-in');
  await chooseLanguage(page, 'id');
  await expect(page.getByRole('heading', { name: T.id.welcome })).toBeVisible();
});

test('TC-074 switching on the builder changes every string and keeps the build and total', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseRequired(page, 'id');
  const total = await page.locator('.hero__total .amount').innerText();
  const chosen = await page.locator('.part__choose[aria-pressed="true"]').count();
  expect(chosen).toBe(6);

  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await expect(page.locator('#cat-storage .cat__title')).toHaveText(T.en.storage);
  await expect(page.locator('.hero__total .label')).toHaveText(T.en.totalSoFar);
  await expect(page.locator('.hero__total .amount')).toHaveText(total);
  await expect(page.locator('.part__choose[aria-pressed="true"]')).toHaveCount(chosen);
  await openPanel(page, 'en');
  await expect(page.getByRole('button', { name: T.en.checkout })).toBeEnabled();

  await closePanel(page, 'en');
  await chooseLanguage(page, 'id');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await expect(page.locator('.hero__total .amount')).toHaveText(total);
  await expect(page.locator('.part__choose[aria-pressed="true"]')).toHaveCount(chosen);
});

test('TC-078 ten switches leave exactly the same page in each language', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseRequired(page, 'id');

  const firstIndonesian = await snapshot(page);
  let firstEnglish = null;
  let lastEnglish = null;
  for (let round = 0; round < 5; round += 1) {
    await chooseLanguage(page, 'en');
    const english = await snapshot(page);
    firstEnglish = firstEnglish || english;
    lastEnglish = english;
    await chooseLanguage(page, 'id');
    const indonesian = await snapshot(page);
    expect(indonesian).toEqual(firstIndonesian);
  }
  expect(lastEnglish).toEqual(firstEnglish);
  // The display type is CSS-uppercased, so compare the words not the casing.
  const lower = (list) => list.map((entry) => entry.toLowerCase());
  expect(lower(lastEnglish.heads)).toEqual(
    lower([T.en.cpu, T.en.motherboard, T.en.ram, T.en.storage, T.en.gpu, T.en.psu, T.en.case]),
  );
  expect(lower(firstIndonesian.heads)).toEqual(
    lower([T.id.cpu, T.id.motherboard, T.id.ram, T.id.storage, T.id.gpu, T.id.psu, T.id.case]),
  );
});

test('TC-094/TC-095 part names and rupiah prices are identical in both languages', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();

  const names = await page.locator('.part__name').allInnerTexts();
  const prices = await page.locator('.part__price').allInnerTexts();
  expect(names).toHaveLength(21);
  expect(prices).toHaveLength(21);
  for (const price of prices) expect(price).toMatch(/^Rp [\d.]+$/);

  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  expect(await page.locator('.part__name').allInnerTexts()).toEqual(names);
  expect(await page.locator('.part__price').allInnerTexts()).toEqual(prices);
  await expect(page.locator('.hero__total .amount')).toHaveText('Rp 0');
});

test('TC-091/TC-092 no page shows a raw key or a blank control in either language', async ({
  page,
}) => {
  for (const path of ['/', '/sign-in', '/sign-up', '/order-review', '/no-such-page']) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await chooseLanguage(page, 'id');
    await expectNoRawKeys(page);
    await chooseLanguage(page, 'en');
    await expectNoRawKeys(page);
    // each page's own headline follows the language
    const titles = {
      '/sign-in': [T.id.welcome, T.en.welcome],
      '/sign-up': ['Buat akun Anda', 'Create your account'],
      '/order-review': ['Periksa rakitan Anda', 'Check your build'],
      '/no-such-page': [T.id.notFoundTitle, T.en.notFoundTitle],
    };
    if (titles[path]) {
      await expect(page.locator('main h1').first()).toHaveText(titles[path][1]);
    }
  }
});

test('TC-075 a half-typed create-account form survives a switch and submits what was typed', async ({
  page,
}) => {
  const email = uniqueEmail('form.keep');
  const registrations = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/v1/auth/register')) {
      registrations.push(request.url());
    }
  });

  await page.goto('/sign-up');
  await expect(page.getByRole('heading', { name: 'Buat akun Anda' })).toBeVisible();
  await page.getByLabel(T.id.fullName).fill('Budi Santoso');
  await page.getByLabel(T.id.email).fill(email);
  await page.getByLabel(T.id.password).fill(PASSWORD);

  await chooseLanguage(page, 'en');
  await expect(page.getByLabel(T.en.fullName)).toHaveValue('Budi Santoso');
  await expect(page.getByLabel(T.en.email)).toHaveValue(email);
  await expect(page.getByLabel(T.en.password)).toHaveValue(PASSWORD);
  expect(registrations).toHaveLength(0);

  await page.getByRole('button', { name: T.en.createAccount }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: T.en.signOut })).toBeVisible();
  await expect(page.locator('.who .name')).toHaveText('Budi Santoso');
  expect(registrations).toHaveLength(1);
});

test('TC-071 the switcher and the builder states switch language together', async ({ page }) => {
  // Empty build.
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await expectSwitcher(page, 'id');
  await expect(page.getByRole('button', { name: T.id.startChoosing })).toBeVisible();
  await chooseLanguage(page, 'en');
  await expect(page.getByRole('button', { name: T.en.startChoosing })).toBeVisible();
  await expectSwitcher(page, 'en');

  // One part chosen only: the panel's missing list is in the language on screen.
  await chooseFirst(page, 'en', 'ram');
  await openPanel(page, 'en');
  await expect(page.locator('#build-panel')).toContainText(T.en.need);
  await closePanel(page, 'en');
  await chooseLanguage(page, 'id');
  await openPanel(page, 'id');
  await expect(page.locator('#build-panel')).toContainText(T.id.need);
});

test('TC-071 the switcher works while the catalogue loads and after it fails', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/catalogue', async (route) => {
    await gate;
    await route.continue();
  });

  await page.goto('/');
  await expect(page.getByText(T.id.loadingCatalogue)).toBeVisible();
  await expectSwitcher(page, 'id');
  await chooseLanguage(page, 'en');
  await expect(page.getByText(T.en.loadingCatalogue)).toBeVisible();
  release();
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await page.unroute('**/api/v1/catalogue');

  await page.route('**/api/v1/catalogue', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        request_id: 'e2e-lang-0001',
        error: { code: 'INTERNAL', message: 'Something went wrong.' },
      }),
    }),
  );
  await page.goto('/');
  await expect(page.getByText(T.en.loadError)).toBeVisible();
  await expectSwitcher(page, 'en');
  await chooseLanguage(page, 'id');
  await expect(page.getByText(T.id.loadError)).toBeVisible();
  await expect(page.getByRole('button', { name: T.id.tryAgain }).first()).toBeVisible();
});

test('TC-096 validation and server messages appear in the language on screen', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('dupe.msg');
  await registerThroughApi(request, baseURL, { email, language: 'id' });

  await page.goto('/sign-in');
  await page.getByRole('button', { name: T.id.signIn }).click();
  await expect(page.getByText(T.id.emptyField)).toBeVisible();
  await chooseLanguage(page, 'en');
  await expect(page.getByText(T.en.emptyField)).toBeVisible();

  await page.getByLabel(T.en.email).fill(email);
  await page.getByLabel(T.en.password).fill('Wrong1234');
  await page.getByRole('button', { name: T.en.signIn }).click();
  await expect(page.getByText(T.en.wrongPassword)).toBeVisible();
  await chooseLanguage(page, 'id');
  await expect(page.getByText(T.id.wrongPassword)).toBeVisible();

  await page.goto('/sign-up');
  await createAccount(page, 'id', { fullName: 'Dupe Buyer', email });
  await expect(page.getByText(T.id.duplicate)).toBeVisible();
  await chooseLanguage(page, 'en');
  await expect(page.getByText(T.en.duplicate)).toBeVisible();
});

test('TC-099 the refused-checkout message names the empty categories in the language shown', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseFirst(page, 'id', 'ram');
  await startCheckout(page, 'id');

  const notice = page.locator('.cats .notice--error');
  await expect(notice).toContainText(T.id.needAll);
  await expect(notice).toContainText(T.id.stillEmpty);
  await expect(notice).not.toContainText('Kartu Grafis');

  await closePanel(page, 'id');
  await chooseLanguage(page, 'en');
  await expect(notice).toContainText(T.en.needAll);
  await expect(notice).toContainText(T.en.stillEmpty);
  await expect(notice).not.toContainText('Graphics Card');
});

test('TC-079 a language chosen on the device is remembered across reload and a new tab', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseLanguage(page, 'en');
  await expect(page.locator('#cat-cpu .cat__title')).toHaveText(T.en.cpu);

  await page.reload();
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await expectSwitcher(page, 'en');

  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: T.en.welcome })).toBeVisible();
  await page.goto('/sign-up');
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

  const second = await page.context().newPage();
  await second.goto('/');
  await expect(second.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await second.close();
});

test('TC-080 signing out keeps the language last used on the device', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('signout');
  await registerThroughApi(request, baseURL, { email, language: 'id' });

  await page.goto('/');
  await chooseLanguage(page, 'en');
  await page.goto('/sign-in');
  await signIn(page, 'en', email);
  await expect(page).toHaveURL('/');
  // The account is Indonesian (TC-082), even though the device was English.
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();

  await page.getByRole('button', { name: T.id.signOut }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await expectSwitcher(page, 'id');
  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
});

for (const stored of ['fr', '', 'EN']) {
  test(`TC-086 a stored "${stored}" shows Indonesian and never blocks sign-in`, async ({
    page,
    request,
    baseURL,
  }) => {
    const email = uniqueEmail('stored');
    await registerThroughApi(request, baseURL, { email, language: 'id' });
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [STORAGE_KEY, stored],
    );

    await page.goto('/');
    await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
    await expectSwitcher(page, 'id');

    await page.goto('/sign-in');
    await signIn(page, 'id', email);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: T.id.signOut })).toBeVisible();
    await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  });
}

test('TC-085 a switch made while signed out never changes the account', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('device.only');
  await registerThroughApi(request, baseURL, { email, language: 'id' });

  await page.goto('/sign-in');
  await signIn(page, 'id', email);
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();

  await page.getByRole('button', { name: T.id.signOut }).click();
  await expect(page).toHaveURL('/');
  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();

  await page.goto('/sign-in');
  await signIn(page, 'en', email);
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
});

test('TC-081/TC-083 an account keeps the language it was created in, on any device', async ({
  page,
  browser,
  baseURL,
}) => {
  const englishEmail = uniqueEmail('lang.en');
  const indonesianEmail = uniqueEmail('lang.id');

  await page.goto('/sign-up');
  await chooseLanguage(page, 'en');
  await createAccount(page, 'en', { fullName: 'English Buyer', email: englishEmail });
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();
  await page.getByRole('button', { name: T.en.signOut }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/sign-up');
  await chooseLanguage(page, 'id');
  await createAccount(page, 'id', { fullName: 'Buyer Indonesia', email: indonesianEmail });
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await page.getByRole('button', { name: T.id.signOut }).click();
  await expect(page).toHaveURL('/');

  // A fresh device starts Indonesian and takes each account's own language.
  for (const [email, lang] of [
    [englishEmail, 'en'],
    [indonesianEmail, 'id'],
  ]) {
    const context = await browser.newContext({ baseURL, locale: 'id-ID' });
    const fresh = await context.newPage();
    await fresh.goto('/sign-in');
    await expect(fresh.getByRole('heading', { name: T.id.welcome })).toBeVisible();
    await signIn(fresh, 'id', email);
    await expect(fresh).toHaveURL('/');
    await expect(fresh.locator('#cat-cpu .cat__title')).toHaveText(T[lang].cpu);
    await context.close();
  }
});

test('TC-084 a signed-in switch is saved to the account and follows it to another device', async ({
  page,
  browser,
  baseURL,
  request,
}) => {
  const email = uniqueEmail('saved');
  await registerThroughApi(request, baseURL, { email, language: 'id' });

  await page.goto('/sign-in');
  await signIn(page, 'id', email);
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();

  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();

  await page.getByRole('button', { name: T.en.signOut }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/sign-in');
  await signIn(page, 'en', email);
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: T.en.cpu })).toBeVisible();

  const context = await browser.newContext({ baseURL, locale: 'id-ID' });
  const fresh = await context.newPage();
  await fresh.goto('/sign-in');
  await signIn(fresh, 'id', email);
  await expect(fresh).toHaveURL('/');
  await expect(fresh.locator('#cat-cpu .cat__title')).toHaveText(T.en.cpu);
  await context.close();
});

test('TC-072/TC-076 the review and the not-found page keep the switcher, the parts and the total', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('review');
  await registerThroughApi(request, baseURL, { email, language: 'id' });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseRequired(page, 'id');
  const total = await page.locator('.hero__total .amount').innerText();

  await startCheckout(page, 'id');
  await signIn(page, 'id', email);
  await expect(page).toHaveURL('/order-review');
  await expect(page.locator('.orow')).toHaveCount(6);
  await expect(page.locator('.order-total .amount')).toHaveText(total);
  await expectSwitcher(page, 'id');
  const parts = await page.locator('.orow__part').allInnerTexts();

  await chooseLanguage(page, 'en');
  await expect(page.getByText(T.en.finalTotal)).toBeVisible();
  await expect(page.getByRole('button', { name: T.en.placeOrder })).toBeVisible();
  expect(await page.locator('.orow__part').allInnerTexts()).toEqual(parts);
  await expect(page.locator('.order-total .amount')).toHaveText(total);

  await chooseLanguage(page, 'id');
  await expect(page.getByText(T.id.finalTotal)).toBeVisible();
  await expect(page.locator('.order-total .amount')).toHaveText(total);

  await page.goto('/no-such-page');
  await expect(page.getByRole('heading', { name: T.id.notFoundTitle })).toBeVisible();
  await expectSwitcher(page, 'id');
  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.notFoundTitle })).toBeVisible();
  await expectSwitcher(page, 'en');
  await page.locator('main').getByRole('link', { name: 'Back to the builder' }).click();
  await expect(page).toHaveURL('/');
});

test('TC-077/TC-098 switching never submits an order, and the confirmation re-renders unchanged', async ({
  page,
  request,
  baseURL,
}) => {
  const email = uniqueEmail('confirm');
  await registerThroughApi(request, baseURL, { email, language: 'id' });
  const placed = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/v1/orders')) {
      placed.push(request.url());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: T.id.cpu })).toBeVisible();
  await chooseRequired(page, 'id');
  const total = await page.locator('.hero__total .amount').innerText();

  await startCheckout(page, 'id');
  await signIn(page, 'id', email);
  await expect(page).toHaveURL('/order-review');
  const parts = await page.locator('.orow__part').allInnerTexts();

  for (let round = 0; round < 5; round += 1) {
    const lang = round % 2 === 0 ? 'en' : 'id';
    await chooseLanguage(page, lang);
    await expect(page.getByRole('button', { name: T[lang].signOut })).toBeVisible();
    await expect(page.locator('.order-total .amount')).toHaveText(total);
    expect(await page.locator('.orow__part').allInnerTexts()).toEqual(parts);
  }
  expect(placed).toHaveLength(0);

  await chooseLanguage(page, 'id');
  await page.getByRole('button', { name: T.id.placeOrder }).click();
  await expect(page).toHaveURL(/\/order-confirmation\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { name: T.id.confirmTitle })).toBeVisible();
  expect(placed).toHaveLength(1);
  expect(await page.locator('.orow__part').allInnerTexts()).toEqual(parts);
  await expect(page.locator('.order-total .amount')).toHaveText(total);
  await expectSwitcher(page, 'id');

  await chooseLanguage(page, 'en');
  await expect(page.getByRole('heading', { name: T.en.confirmTitle })).toBeVisible();
  expect(await page.locator('.orow__part').allInnerTexts()).toEqual(parts);
  await expect(page.locator('.order-total .amount')).toHaveText(total);

  // The reload keeps the chosen language, and the switcher is there while the
  // order loads, not only once it arrives.
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/orders/*', async (route) => {
    await gate;
    await route.continue();
  });
  await page.reload();
  await expect(page.getByText(T.en.confirmLoading)).toBeVisible();
  await expectSwitcher(page, 'en');
  release();
  await expect(page.getByRole('heading', { name: T.en.confirmTitle })).toBeVisible();
  await expect(page.locator('.order-total .amount')).toHaveText(total);
  expect(await page.locator('.order__part, .orow__part').allInnerTexts()).toEqual(parts);
});
