import { expect, test as base } from '@playwright/test';

// The app opens in Indonesian on a fresh device. The journeys below were
// written for the English screens, so they pin English before the app boots.
// language.spec.js imports @playwright/test directly: it tests the default.
export const test = base.extend({
  page: async ({ page }, handoff) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('compzy.lang.v1', 'en');
      } catch {
        // storage blocked: the app falls back to Indonesian and the journey
        // fails on its English expectations, which is the right signal.
      }
    });
    await handoff(page);
  },
});

export { expect };
