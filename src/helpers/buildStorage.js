// The build is a map of category code -> part id, kept between visits.
export const BUILD_STORAGE_KEY = 'compzy.build.v1';

export function loadBuild() {
  try {
    const raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, id]) => typeof id === 'string' && id !== ''),
    );
  } catch {
    return {};
  }
}

export function saveBuild(build) {
  try {
    window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(build));
  } catch {
    // A full or blocked storage must not break the builder.
  }
}

export function clearBuild() {
  try {
    window.localStorage.removeItem(BUILD_STORAGE_KEY);
  } catch {
    // Nothing to do: the build is session state.
  }
}
