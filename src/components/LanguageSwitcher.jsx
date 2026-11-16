import { useLanguage, useT } from '../store/LanguageContext';

// Two labelled choices on a wide header, the same two in a native picker where
// the header is narrow. Both names stay in their own language in either
// interface language (REQ-042), and the control is the header's last item,
// signed in or signed out.
export function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage();
  const t = useT();

  return (
    <>
      <div className="lang" role="group" aria-label={t.language.label}>
        <button
          className="lang__opt"
          type="button"
          lang="en"
          aria-pressed={lang === 'en'}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <span className="lang__sep" aria-hidden="true" />
        <button
          className="lang__opt"
          type="button"
          lang="id"
          aria-pressed={lang === 'id'}
          onClick={() => setLanguage('id')}
        >
          Bahasa Indonesia
        </button>
      </div>
      <span className="lang__pick">
        <select
          aria-label={t.language.label}
          value={lang}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="id" lang="id">
            Bahasa Indonesia
          </option>
          <option value="en" lang="en">
            English
          </option>
        </select>
      </span>
    </>
  );
}
