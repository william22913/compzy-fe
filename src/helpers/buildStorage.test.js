import { describe, expect, it } from 'vitest';
import { BUILD_STORAGE_KEY, clearBuild, loadBuild, saveBuild } from './buildStorage';

describe('build storage', () => {
  it('round-trips the category-to-part map', () => {
    saveBuild({ cpu: '11111111-1111-4111-8111-111111111111' });
    expect(loadBuild()).toEqual({ cpu: '11111111-1111-4111-8111-111111111111' });
  });

  it('starts empty when nothing is stored', () => {
    expect(loadBuild()).toEqual({});
  });

  it('ignores corrupt or unexpected stored values', () => {
    window.localStorage.setItem(BUILD_STORAGE_KEY, '{not json');
    expect(loadBuild()).toEqual({});
    window.localStorage.setItem(BUILD_STORAGE_KEY, '[1,2,3]');
    expect(loadBuild()).toEqual({});
  });

  it('drops entries that are not part ids', () => {
    window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify({ cpu: 42, ram: 'abc' }));
    expect(loadBuild()).toEqual({ ram: 'abc' });
  });

  it('clears the stored build', () => {
    saveBuild({ cpu: 'abc' });
    clearBuild();
    expect(window.localStorage.getItem(BUILD_STORAGE_KEY)).toBeNull();
  });
});
