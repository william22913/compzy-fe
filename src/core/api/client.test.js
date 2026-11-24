import { afterEach, describe, expect, it, vi } from 'vitest';

// The API base is built at import from the app's mount, so each case re-imports
// the client against the document it should see.
async function loadClient() {
  vi.resetModules();
  return import('./client');
}

function setBase(href) {
  const element = document.createElement('base');
  element.href = href;
  document.head.append(element);
}

function setLocation(path) {
  window.history.replaceState({}, '', path);
}

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ data: { categories: [] } }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelectorAll('base').forEach((element) => element.remove());
  window.history.replaceState({}, '', '/');
});

describe('apiRequest URLs', () => {
  it('calls /api/v1 on the app origin at a site root', async () => {
    const fetchMock = stubFetch();
    const { apiRequest } = await loadClient();
    await apiRequest('/catalogue');
    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/api/v1/catalogue`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('calls /api/v1 under the mount, never at the origin root', async () => {
    setLocation('/stack/token/app/');
    setBase(`${window.location.origin}/stack/token/app/`);
    const fetchMock = stubFetch();
    const { apiRequest } = await loadClient();
    await apiRequest('/orders/abc');
    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/stack/token/app/api/v1/orders/abc`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('keeps a write under the mount too', async () => {
    setLocation('/stack/token/app/');
    setBase(`${window.location.origin}/stack/token/app/`);
    const fetchMock = stubFetch();
    const { apiRequest } = await loadClient();
    await apiRequest('/orders', { method: 'POST', body: { part_ids: [] } });
    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/stack/token/app/api/v1/orders`,
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
