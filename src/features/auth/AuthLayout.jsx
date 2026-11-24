import { useT } from '../../store/LanguageContext';
import { appUrl } from '../../core/base';

export function AuthLayout({ eyebrow, title, lede, notice, foot, caption, flip, children }) {
  const t = useT();
  return (
    <main className="main">
      <div className="split">
        <div className={`split__body${flip ? ' flip-body' : ''}`}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display">{title}</h1>
          <p className="lede">{lede}</p>
          {notice}
          {children}
          <p className="form__foot">{foot}</p>
        </div>
        <figure className={`split__media${flip ? ' flip' : ''}`}>
          <img src={appUrl('assets/img/auth.webp')} alt={t.auth.imageAlt} width="960" height="640" />
          <figcaption>{caption}</figcaption>
        </figure>
      </div>
    </main>
  );
}
