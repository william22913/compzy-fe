import en from './en.json';

// Fill {name} placeholders in a dictionary string. Unknown placeholders are
// left as they are so a missing value is visible instead of silently blank.
export function fmt(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

export default en;
