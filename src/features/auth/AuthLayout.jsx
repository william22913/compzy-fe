import en from '../../locales';

export function AuthLayout({ eyebrow, title, lede, notice, foot, caption, flip, children }) {
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
          <img src="/assets/img/auth.webp" alt={en.auth.imageAlt} width="960" height="640" />
          <figcaption>{caption}</figcaption>
        </figure>
      </div>
    </main>
  );
}
