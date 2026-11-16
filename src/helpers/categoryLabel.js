// Category names are translated by their catalogue code, never by the English
// name the API also sends (REQ-050, TC-099). Part names are never translated.
export function categoryLabel(t, code, fallback) {
  return (t.categories && code && t.categories[code]) || fallback || '';
}
