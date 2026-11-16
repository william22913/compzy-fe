import { describe, expect, it } from 'vitest';
import en from './en.json';
import id from './id.json';
import { withFallback } from './index';

// Every key path of a dictionary. Arrays are one value (a list of strings, or
// of segments, translated as a whole).
function leaves(value, prefix = '') {
  if (Array.isArray(value) || !value || typeof value !== 'object') {
    return [[prefix, value]];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

// Every string inside a leaf value, arrays included.
function strings(value) {
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [value];
}

const enKeys = leaves(en).map(([key]) => key).sort();
const idKeys = leaves(id).map(([key]) => key).sort();

// The codes architecture.md's error contract lists for the fields a form shows.
const FIELD_CODES = [
  'field.full_name.required',
  'field.full_name.length',
  'field.email.required',
  'field.email.invalid',
  'field.email.length',
  'field.password.required',
  'field.password.rule',
  'field.preferred_language.required',
  'field.preferred_language.invalid',
];

const CATEGORY_CODES = ['cpu', 'motherboard', 'ram', 'storage', 'gpu', 'psu', 'case'];

describe('locale dictionaries', () => {
  it('hold exactly the same key set', () => {
    expect(idKeys).toEqual(enKeys);
  });

  it('have no blank string on either side', () => {
    const enValues = leaves(en).flatMap(([, value]) => strings(value));
    const idValues = leaves(id).flatMap(([, value]) => strings(value));
    for (const value of [...enValues, ...idValues]) {
      expect(typeof value).toBe('string');
      expect(value.trim()).not.toBe('');
      expect(value).not.toMatch(/^[a-z_]+\.[a-z_.]+$/);
    }
  });

  it('keep every list the same length in both languages', () => {
    const at = (root, path) =>
      path.split('.').reduce((node, part) => (node == null ? undefined : node[part]), root);
    for (const [key, value] of leaves(en)) {
      if (!Array.isArray(value)) continue;
      const other = at(id, key);
      expect(Array.isArray(other), key).toBe(true);
      expect(other.length, key).toBe(value.length);
    }
  });

  it('cover every field error code the forms render', () => {
    for (const code of FIELD_CODES) {
      expect(en.auth.fieldErrors[code], code).toBeTruthy();
      expect(id.auth.fieldErrors[code], code).toBeTruthy();
    }
  });

  it('translate every category by its code', () => {
    for (const code of CATEGORY_CODES) {
      expect(en.categories[code], code).toBeTruthy();
      expect(id.categories[code], code).toBeTruthy();
      expect(en.builder.catNotes[code], code).toBeTruthy();
      expect(id.builder.catNotes[code], code).toBeTruthy();
    }
    expect(id.categories.cpu).toBe('Prosesor (CPU)');
    expect(id.categories.case).toBe('Casing PC');
  });

  it('keep product names, brands and rupiah amounts identical in both languages', () => {
    expect(id.builder.facts[2].value).toBe(en.builder.facts[2].value);
    expect(id.builder.facts[3].value).toBe(en.builder.facts[3].value);
    expect(id.chrome.brand).toBe(en.chrome.brand);
  });

  it('address the customer as "Anda", never informally', () => {
    const informal = /\b(kamu|kau|engkau|lu|gue|aku)\b/i;
    for (const [key, value] of leaves(id)) {
      for (const text of strings(value)) expect(text, key).not.toMatch(informal);
    }
  });

  it('resolve a key missing in the active dictionary to its Indonesian string', () => {
    expect(withFallback({ a: 'English', b: 'English only' }, { a: 'Indonesia' })).toEqual({
      a: 'English',
      b: 'English only',
    });
    // Drop one English key and the Indonesian string takes its place — never
    // the key itself, a blank, or an English sentence on an Indonesian page.
    const withoutChoose = {
      ...en,
      builder: Object.fromEntries(
        Object.entries(en.builder).filter(([key]) => key !== 'choose'),
      ),
    };
    const resolved = withFallback(withoutChoose, id);
    expect(resolved.builder.choose).toBe(id.builder.choose);
    expect(resolved.builder.choose).not.toBe('builder.choose');
  });
});
