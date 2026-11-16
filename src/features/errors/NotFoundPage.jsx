import { Link } from 'react-router-dom';
import en from '../../locales';

export function NotFoundPage() {
  return (
    <main className="main">
      <div className="split">
        <div className="split__body">
          <span className="eyebrow">{en.notFound.eyebrow}</span>
          <h1 className="display">{en.notFound.title}</h1>
          <p className="lede">{en.notFound.body}</p>
          <p className="form__foot">
            <Link className="btn btn--ghost" to="/">
              {en.notFound.action}
            </Link>
          </p>
        </div>
        <figure className="split__media">
          <img
            src="/assets/img/review.webp"
            alt=""
            width="1920"
            height="1260"
          />
        </figure>
      </div>
    </main>
  );
}
