import { Link } from 'react-router-dom';
import { useT } from '../../store/LanguageContext';

export function NotFoundPage() {
  const t = useT();

  return (
    <main className="main">
      <div className="wrap nf">
        <span className="eyebrow">{t.notFound.eyebrow}</span>
        <h1 className="display">{t.notFound.title}</h1>
        <p className="lede">{t.notFound.body}</p>
        <div className="nf__actions">
          <Link className="btn" to="/">
            {t.notFound.action}
          </Link>
        </div>
      </div>
    </main>
  );
}
