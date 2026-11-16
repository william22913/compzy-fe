import { Fragment, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Notice } from '../../components/Notice';
import { Ribbons } from '../../components/Ribbons';
import { formatRupiah } from '../../helpers/money';
import { signInHref } from '../../helpers/returnTo';
import { categoryLabel } from '../../helpers/categoryLabel';
import { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { useT } from '../../store/LanguageContext';
import { BuildBar } from './BuildBar';
import { BuildPanel } from './BuildPanel';
import { BuilderSkeleton } from './BuilderSkeleton';
import { CategorySection } from './CategorySection';

export function BuilderPage() {
  const { status, categories, reload } = useCatalogue();
  const build = useBuild();
  const { status: authStatus } = useAuth();
  const t = useT();
  const [refused, setRefused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const catsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (build.complete) setRefused(false);
  }, [build.complete]);

  // Arriving from the review with "Choose another RAM" lands on that category.
  useEffect(() => {
    const focus = location.state && location.state.focus;
    if (!focus || status !== 'ready') return;
    const target = document.getElementById(`cat-${focus}`);
    if (target) target.scrollIntoView();
  }, [location.state, status]);

  const ready = status === 'ready';
  const signedOut = Boolean(location.state && location.state.signedOut);
  const totalLabel = ready ? formatRupiah(build.total) : '-';

  function jumpToParts() {
    if (catsRef.current) catsRef.current.scrollIntoView();
  }

  function checkout() {
    if (!build.complete) {
      setRefused(true);
      return;
    }
    if (authStatus !== 'member') {
      navigate(signInHref('/order-review'));
      return;
    }
    navigate('/order-review');
  }

  const missingNames = build.missing
    .map((row) => categoryLabel(t, row.category.code, row.category.name))
    .join(', ');
  const removedCategory = build.removed
    ? categoryLabel(t, build.removed.categoryCode, build.removed.categoryName)
    : '';

  return (
    <main className="main">
      <div className="hero">
        <div className="hero__body">
          <span className="eyebrow">{t.builder.eyebrow}</span>
          <h1 className="display">
            {t.builder.title.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line.map((segment, segmentIndex) =>
                  typeof segment === 'string' ? (
                    <Fragment key={segmentIndex}>{segment}</Fragment>
                  ) : (
                    <span className="disc" key={segmentIndex}>
                      {segment.disc}
                    </span>
                  ),
                )}
              </Fragment>
            ))}
          </h1>
          <p className="hero__sub">{t.builder.sub}</p>
          <div className="hero__foot">
            <div className="hero__total">
              <span className="label">{t.builder.totalSoFar}</span>
              <span className="amount num">{totalLabel}</span>
            </div>
            {ready && (
              <button className="btn btn--ghost" type="button" onClick={jumpToParts}>
                {build.selectedCount > 0 ? t.builder.keepChoosing : t.builder.startChoosing}
              </button>
            )}
            {status === 'error' && (
              <button className="btn btn--ghost" type="button" onClick={reload}>
                {t.builder.tryAgain}
              </button>
            )}
          </div>
        </div>
        <figure className="hero__media">
          <img
            src="/assets/img/review.webp"
            alt={t.builder.heroImageAlt}
            width="1920"
            height="1260"
            fetchPriority="high"
          />
          <figcaption className="hero__cap">{t.builder.heroCaption}</figcaption>
        </figure>
      </div>

      <Ribbons dark={t.builder.ribbonDark} blush={t.builder.ribbonBlush} />

      <div className="wrap">
        <div className="facts">
          {t.builder.facts.map((fact) => (
            <div key={fact.key}>
              <span className="v serif-num">{fact.value}</span>
              <span className="k">{fact.key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap builder">
        <div
          className="cats"
          ref={catsRef}
          aria-busy={status === 'loading' ? 'true' : undefined}
          aria-live={status === 'loading' ? 'polite' : undefined}
        >
          {status === 'loading' && <BuilderSkeleton />}

          {status === 'error' && (
            <Notice tone="error" title={t.builder.loadErrorTitle}>
              <p>{t.builder.loadErrorBody}</p>
              <p style={{ marginTop: 'var(--s4)' }}>
                <button className="btn btn--ghost" type="button" onClick={reload}>
                  {t.builder.tryAgain}
                </button>
              </p>
            </Notice>
          )}

          {ready && signedOut && (
            <Notice tone="info" title={t.builder.signedOutTitle}>
              <p>
                {t.builder.signedOutBody}{' '}
                <Link className="textlink" to="/sign-in">
                  {t.builder.signedOutAction}
                </Link>
              </p>
            </Notice>
          )}

          {ready && build.removed && (
            <Notice
              tone="error"
              title={fmt(t.builder.partGoneTitle, { category: removedCategory })}
            >
              <p>{fmt(t.builder.partGoneBody, { category: removedCategory })}</p>
            </Notice>
          )}

          {ready && refused && !build.complete && (
            <Notice tone="error" title={t.builder.checkoutRefusedTitle}>
              <p>{fmt(t.builder.checkoutRefusedBody, { list: missingNames })}</p>
            </Notice>
          )}

          {ready &&
            categories.map((category, index) => (
              <CategorySection
                key={category.code}
                category={category}
                index={index}
                selectedPartId={build.rows[index] ? build.rows[index].part?.id : undefined}
                onChoose={build.choose}
              />
            ))}
        </div>

        <BuildPanel catalogueStatus={status} onCheckout={checkout} open={panelOpen} />
      </div>

      {ready && <BuildBar open={panelOpen} onToggle={() => setPanelOpen((open) => !open)} />}
    </main>
  );
}
