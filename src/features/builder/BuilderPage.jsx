import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Notice } from '../../components/Notice';
import { Ribbons } from '../../components/Ribbons';
import { formatRupiah } from '../../helpers/money';
import { signInHref } from '../../helpers/returnTo';
import en, { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { BuildBar } from './BuildBar';
import { BuildPanel } from './BuildPanel';
import { BuilderSkeleton } from './BuilderSkeleton';
import { CategorySection } from './CategorySection';

export function BuilderPage() {
  const { status, categories, reload } = useCatalogue();
  const build = useBuild();
  const { status: authStatus } = useAuth();
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

  const missingNames = build.missing.map((row) => row.category.name).join(', ');

  return (
    <main className="main">
      <div className="hero">
        <div className="hero__body">
          <span className="eyebrow">{en.builder.eyebrow}</span>
          <h1 className="display">
            {en.builder.titleLine}
            <br />
            <span className="disc">{en.builder.titleDisc}</span>
          </h1>
          <p className="hero__sub">{en.builder.sub}</p>
          <div className="hero__foot">
            <div className="hero__total">
              <span className="label">{en.builder.totalSoFar}</span>
              <span className="amount num">{totalLabel}</span>
            </div>
            {ready && (
              <button className="btn btn--ghost" type="button" onClick={jumpToParts}>
                {build.selectedCount > 0 ? en.builder.keepChoosing : en.builder.startChoosing}
              </button>
            )}
            {status === 'error' && (
              <button className="btn btn--ghost" type="button" onClick={reload}>
                {en.builder.tryAgain}
              </button>
            )}
          </div>
        </div>
        <figure className="hero__media">
          <img
            src="/assets/img/review.webp"
            alt={en.builder.heroImageAlt}
            width="1920"
            height="1260"
            fetchPriority="high"
          />
          <figcaption className="hero__cap">{en.builder.heroCaption}</figcaption>
        </figure>
      </div>

      <Ribbons dark={en.builder.ribbonDark} blush={en.builder.ribbonBlush} />

      <div className="wrap">
        <div className="facts">
          {en.builder.facts.map((fact) => (
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
            <Notice tone="error" title={en.builder.loadErrorTitle}>
              <p>{en.builder.loadErrorBody}</p>
              <p style={{ marginTop: 'var(--s4)' }}>
                <button className="btn btn--ghost" type="button" onClick={reload}>
                  {en.builder.tryAgain}
                </button>
              </p>
            </Notice>
          )}

          {ready && build.removed && (
            <Notice
              tone="error"
              title={fmt(en.builder.partGoneTitle, {
                category: build.removed.categoryName,
              })}
            >
              <p>
                {fmt(en.builder.partGoneBody, { category: build.removed.categoryName })}
              </p>
            </Notice>
          )}

          {ready && refused && !build.complete && (
            <Notice tone="error" title={en.builder.checkoutRefusedTitle}>
              <p>{fmt(en.builder.checkoutRefusedBody, { list: missingNames })}</p>
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
