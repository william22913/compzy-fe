import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../store/AuthContext';
import { CatalogueProvider } from '../../store/CatalogueContext';
import { BuildProvider } from '../../store/BuildContext';
import { BUILD_STORAGE_KEY } from '../../helpers/buildStorage';
import { BuilderPage } from './BuilderPage';
import { cataloguePayload, jsonResponse } from '../../test/fixtures';

function renderBuilder() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CatalogueProvider>
          <BuildProvider>
            <BuilderPage />
          </BuildProvider>
        </CatalogueProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function heroTotal() {
  return document.querySelector('.hero__total .amount');
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      const path = String(url);
      if (path.endsWith('/catalogue')) return jsonResponse(cataloguePayload);
      if (path.endsWith('/auth/me')) {
        return jsonResponse(
          { request_id: 'test-request-0002', error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' } },
          401,
        );
      }
      return jsonResponse({}, 404);
    }),
  );
});

describe('BuilderPage', () => {
  it('renders the catalogue once it loads', async () => {
    renderBuilder();
    expect(
      await screen.findByRole('heading', { name: 'Processor (CPU)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'RAM' })).toBeInTheDocument();
    expect(heroTotal()).toHaveTextContent('Rp 0');
  });

  it('chooses a part, updates the total and toggles it off again', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await screen.findByRole('heading', { name: 'Processor (CPU)' });

    const chooseButtons = screen.getAllByRole('button', { name: 'Choose' });
    await user.click(chooseButtons[0]);

    expect(heroTotal()).toHaveTextContent('Rp 1.350.000');
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    expect(removeButtons[0]).toHaveAttribute('aria-pressed', 'true');

    await user.click(removeButtons[0]);
    expect(heroTotal()).toHaveTextContent('Rp 0');
    expect(screen.getAllByRole('button', { name: 'Choose' })[0]).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('refuses checkout while a required category is empty and says which', async () => {
    const user = userEvent.setup();
    renderBuilder();
    await screen.findByRole('heading', { name: 'Processor (CPU)' });

    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(
      screen.getByText('Checkout needs one part in every required category.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Still empty: Processor \(CPU\), RAM\./)).toBeInTheDocument();
  });

  it('restores a saved build', async () => {
    window.localStorage.setItem(
      BUILD_STORAGE_KEY,
      JSON.stringify({ cpu: '11111111-1111-4111-8111-222222222222' }),
    );
    renderBuilder();
    await screen.findByRole('heading', { name: 'Processor (CPU)' });
    expect(heroTotal()).toHaveTextContent('Rp 2.150.000');
  });

  it('drops a saved part that the catalogue no longer offers and says so', async () => {
    window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify({ cpu: 'gone-part-id' }));
    renderBuilder();
    await screen.findByRole('heading', { name: 'Processor (CPU)' });

    expect(
      screen.getByText('The part you chose for Processor (CPU) is no longer offered.'),
    ).toBeInTheDocument();
    expect(heroTotal()).toHaveTextContent('Rp 0');
    // The drop is written back on the next render, not during the first one.
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem(BUILD_STORAGE_KEY))).toEqual({}),
    );
  });

  it('shows the catalogue error with a retry when the API cannot be reached', async () => {
    fetch.mockImplementation(async (url) => {
      if (String(url).endsWith('/auth/me')) return jsonResponse({}, 401);
      return jsonResponse({ error: { code: 'INTERNAL', message: 'Boom' } }, 500);
    });
    renderBuilder();
    expect(
      await screen.findByText('We could not load the parts catalogue.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Try again' })).toHaveLength(2);
  });
});
