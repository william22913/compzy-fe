import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_LANGUAGE, dictionaries, isLanguage } from '../locales';
import { updateLanguage } from '../core/services/authService';
import { useAuth } from './AuthContext';

export const LANGUAGE_STORAGE_KEY = 'compzy.lang.v1';

const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(value) ? value : null;
  } catch {
    // Storage blocked (private mode, sandboxed preview): the default stands.
    return null;
  }
}

function storeLanguage(lang) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // The choice lasts for this page only; nothing else can be done about it.
  }
}

export function LanguageProvider({ children }) {
  const { status, user, expireSession } = useAuth();
  // Account value first, then the device's last choice, then Indonesian.
  const [lang, setLang] = useState(() => readStoredLanguage() || DEFAULT_LANGUAGE);
  const [saveError, setSaveError] = useState(false);
  // The last language the visitor asked for. Two switches can be in flight, and
  // an earlier PUT answers late: only the latest choice may report a failure.
  const latest = useRef(null);

  // The account's language wins whenever a user object arrives — register,
  // sign-in and GET /auth/me all pass through here. It is also remembered on
  // the device, so the next visitor on this browser sees the same language.
  const accountLanguage = user ? user.preferredLanguage : null;
  useEffect(() => {
    if (status !== 'member' || !isLanguage(accountLanguage)) return;
    setLang(accountLanguage);
    storeLanguage(accountLanguage);
    setSaveError(false);
  }, [status, accountLanguage]);

  const setLanguage = useCallback(
    async (next) => {
      if (!isLanguage(next) || next === lang) return;
      setLang(next);
      storeLanguage(next);
      setSaveError(false);

      // Signed out: the device only, and no request is made at all.
      if (status !== 'member') return;

      latest.current = next;
      try {
        // The screen and the device are already on `next`; the answer only has
        // to confirm it, so it never re-applies a language chosen before it.
        await updateLanguage(next);
      } catch (failure) {
        if (latest.current !== next) return;
        // Keep the language on screen and on the device, and say the save
        // failed. Nothing is rolled back; the next sign-in re-adopts the
        // account's value.
        setSaveError(true);
        if (failure && failure.code === 'UNAUTHENTICATED') expireSession();
      }
    },
    [lang, status, expireSession],
  );

  const value = useMemo(
    () => ({
      lang,
      dict: dictionaries[lang],
      saveError,
      setLanguage,
    }),
    [lang, saveError, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

// The active dictionary. Components read their strings from here.
export function useT() {
  return useLanguage().dict;
}
