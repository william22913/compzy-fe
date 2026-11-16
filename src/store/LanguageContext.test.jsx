import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CatalogueProvider } from './CatalogueContext';
import { BuildProvider } from './BuildContext';
import { LANGUAGE_STORAGE_KEY, LanguageProvider, useLanguage } from './LanguageContext';
import { jsonResponse, cataloguePayload } from '../test/fixtures';

function Probe() {
  const { lang, saveError, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="save-error">{saveError ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => setLanguage('en')}>
        to-english
      </button>
      <button type="button" onClick={() => setLanguage('id')}>
        to-indonesian
      </button>
      <button type="button" onClick={() => setLanguage('fr')}>
        to-unknown
      </button>
    </div>
  );
}

function renderProbe() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LanguageProvider>
          <CatalogueProvider>
            <BuildProvider>
              <Routes>
                <Route path="*" element={<Probe />} />
              </Routes>
            </BuildProvider>
          </CatalogueProvider>
        </LanguageProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function stubApi({ user = null, languageStatus = 200 } = {}) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      const path = String(url);
      calls.push({ path, method: options.method || 'GET', body: options.body });
      if (path.endsWith('/catalogue')) return jsonResponse(cataloguePayload);
      if (path.endsWith('/auth/me/language')) {
        if (languageStatus !== 200) {
          return jsonResponse(
            { request_id: 'r-lang', error: { code: 'INTERNAL', message: 'Boom' } },
            languageStatus,
          );
        }
        return jsonResponse({
          request_id: 'r-lang',
          data: { user: { ...user, preferred_language: JSON.parse(options.body).preferred_language } },
        });
      }
      if (path.endsWith('/auth/me')) {
        if (!user) {
          return jsonResponse({ error: { code: 'UNAUTHENTICATED', message: 'Sign in.' } }, 401);
        }
        return jsonResponse({ request_id: 'r-me', data: { user } });
      }
      return jsonResponse({}, 404);
    }),
  );
  return calls;
}

const MEMBER = {
  id: 'u1',
  full_name: 'Rina Prasetyo',
  email: 'rina@example.com',
  preferred_language: 'id',
};

beforeEach(() => {
  stubApi({ user: null });
});

describe('LanguageProvider', () => {
  it('opens in Indonesian for a first-time visitor', async () => {
    renderProbe();
    expect(screen.getByTestId('lang')).toHaveTextContent('id');
  });

  it('opens in the device language when one is stored', async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    renderProbe();
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('shows Indonesian when the stored value is not one of the two languages', async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    renderProbe();
    expect(screen.getByTestId('lang')).toHaveTextContent('id');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('fr');
  });

  it('writes a signed-out choice to the device and makes no language request', async () => {
    const user = userEvent.setup();
    const calls = stubApi({ user: null });
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'to-english' }));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    await waitFor(() => expect(calls.some((call) => call.path.endsWith('/auth/me'))).toBe(true));
    expect(calls.filter((call) => call.path.includes('/language'))).toHaveLength(0);
  });

  it('ignores a value that is neither en nor id', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'to-unknown' }));
    expect(screen.getByTestId('lang')).toHaveTextContent('id');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  it('adopts the account language from GET /auth/me and stores it on the device', async () => {
    stubApi({ user: { ...MEMBER, preferred_language: 'en' } });
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('en'));
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('saves a signed-in change with only the language in the body', async () => {
    const user = userEvent.setup();
    const calls = stubApi({ user: MEMBER });
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('id'));

    await user.click(screen.getByRole('button', { name: 'to-english' }));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');

    const save = calls.find((call) => call.path.endsWith('/auth/me/language'));
    expect(save).toBeTruthy();
    expect(save.method).toBe('PUT');
    expect(JSON.parse(save.body)).toEqual({ preferred_language: 'en' });
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('keeps the new language on screen and on the device when the save fails', async () => {
    const user = userEvent.setup();
    stubApi({ user: MEMBER, languageStatus: 500 });
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('id'));

    await user.click(screen.getByRole('button', { name: 'to-english' }));
    await waitFor(() => expect(screen.getByTestId('save-error')).toHaveTextContent('yes'));
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('never reports a save that failed after a newer choice was made', async () => {
    const user = userEvent.setup();
    const pending = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        const path = String(url);
        if (path.endsWith('/catalogue')) return Promise.resolve(jsonResponse(cataloguePayload));
        if (path.endsWith('/auth/me/language')) {
          return new Promise((resolve, reject) => pending.push({ resolve, reject }));
        }
        if (path.endsWith('/auth/me')) {
          return Promise.resolve(jsonResponse({ request_id: 'r-me', data: { user: MEMBER } }));
        }
        return Promise.resolve(jsonResponse({}, 404));
      }),
    );
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('id'));

    await user.click(screen.getByRole('button', { name: 'to-english' }));
    await user.click(screen.getByRole('button', { name: 'to-indonesian' }));
    expect(pending).toHaveLength(2);

    // The newer choice is answered last-in, first-out; the superseded first
    // request then fails, and must not raise a warning on the newer one.
    pending[1].resolve(jsonResponse({ request_id: 'r-2', data: { user: MEMBER } }));
    pending[0].reject(new Error('boom'));
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('id'));
    expect(screen.getByTestId('save-error')).toHaveTextContent('no');
  });

  it('adopts the account\'s language over the device\'s choice at sign-in', async () => {
    const user = userEvent.setup();
    // The visitor picked English on this device; the account says Indonesian.
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    stubApi({ user: MEMBER });
    renderProbe();
    await waitFor(() => expect(screen.getByTestId('lang')).toHaveTextContent('id'));
    expect(screen.getByTestId('lang')).toHaveTextContent('id');
    // And a later switch is saved to the account, not only the device.
    await user.click(screen.getByRole('button', { name: 'to-english' }));
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
