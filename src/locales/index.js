import en from './en.json';
import id from './id.json';

export const LANGUAGES = ['en', 'id'];
export const DEFAULT_LANGUAGE = 'id';

// The two dictionaries hold the same key set. Indonesian is the base language:
// a key missing in the active dictionary resolves to its Indonesian string, so
// an Indonesian page never shows a raw key, a blank, or an English sentence.
export function withFallback(primary, fallback) {
  if (Array.isArray(primary) || primary === null || typeof primary !== 'object') {
    return primary === undefined ? fallback : primary;
  }
  const base = fallback && typeof fallback === 'object' && !Array.isArray(fallback) ? fallback : {};
  const merged = {};
  for (const key of new Set([...Object.keys(base), ...Object.keys(primary)])) {
    const value = withFallback(primary[key], base[key]);
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

export const dictionaries = {
  en: withFallback(en, id),
  id: withFallback(id, id),
};

export function isLanguage(value) {
  return value === 'en' || value === 'id';
}

// Fill {name} placeholders in a dictionary string. Unknown placeholders are
// left as they are so a missing value is visible instead of silently blank.
export function fmt(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

// A notice can be raised while one language is on screen and read after the
// switch. It keeps the dictionary path, not the sentence, and is filled in at
// render so it follows the active language (REQ-043).
export function lookup(dict, path, vars) {
  const value = String(path)
    .split('.')
    .reduce((node, part) => (node == null ? undefined : node[part]), dict);
  return typeof value === 'string' ? fmt(value, vars) : '';
}

export default dictionaries[DEFAULT_LANGUAGE];
