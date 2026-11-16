import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice } from '../../components/Notice';
import { OrderRows } from '../../components/OrderRows';
import { Seal } from '../../components/Seal';
import { formatRupiah } from '../../helpers/money';
import { signInHref } from '../../helpers/returnTo';
import en, { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { placeOrder } from '../../core/services/orderService';

export function ReviewPage() {
  const { status: authStatus, expireSession } = useAuth();
  const { status: catalogueStatus, reload } = useCatalogue();
  const build = useBuild();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [gone, setGone] = useState([]);

  const goneByCode = new Map(gone.map((entry) => [entry.categoryCode, entry]));
  const rows = build.rows
    .map(({ category, part }) => {
      const goneEntry = part ? null : goneByCode.get(category.code);
      return {
        key: category.code,
        categoryCode: category.code,
        categoryName: category.name,
        optional: !category.required,
        gone: Boolean(goneEntry),
        partName: goneEntry ? goneEntry.partName : part && part.name,
        priceRupiah: goneEntry ? goneEntry.priceRupiah : part && part.priceRupiah,
      };
    })
    .filter((row) => row.partName);

  const firstGone = gone[0];

  async function handleSubmit(event) {
    event.preventDefault();
    if (!build.complete || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const order = await placeOrder({
        partIds: build.partIds,
        reviewedTotalRupiah: build.total,
      });
      build.clear();
      navigate(`/order-confirmation/${order.id}`);
    } catch (failure) {
      switch (failure.code) {
        case 'UNAUTHENTICATED':
          expireSession();
          setError({
            code: 'UNAUTHENTICATED',
            tone: 'info',
            title: en.review.sessionTitle,
            body: en.review.sessionBody,
          });
          break;
        case 'PART_UNAVAILABLE': {
          const unavailable = Array.isArray(failure.details.unavailable_part_ids)
            ? failure.details.unavailable_part_ids
            : [];
          const lost = build.rows
            .filter((row) => row.part && unavailable.includes(row.part.id))
            .map((row) => ({
              categoryCode: row.category.code,
              categoryName: row.category.name,
              partName: row.part.name,
              priceRupiah: row.part.priceRupiah,
            }));
          for (const entry of lost) build.removePart(entry.categoryCode);
          setGone(lost);
          setError({
            code: 'PART_UNAVAILABLE',
            tone: 'error',
            title:
              lost.length > 1
                ? en.review.partGoneManyTitle
                : fmt(en.review.partGoneTitle, {
                    name: lost.length === 1 ? lost[0].partName : '',
                  }),
            body:
              lost.length > 1
                ? en.review.partGoneManyBody
                : fmt(en.review.partGoneBody, {
                    category: lost.length === 1 ? lost[0].categoryName : '',
                  }),
          });
          break;
        }
        case 'TOTAL_CHANGED':
          await reload();
          setError({
            code: 'TOTAL_CHANGED',
            tone: 'error',
            title: en.review.totalChangedTitle,
            body: en.review.totalChangedBody,
          });
          break;
        case 'BUILD_INCOMPLETE':
          setError({
            code: 'BUILD_INCOMPLETE',
            tone: 'error',
            title: en.review.incompleteTitle,
            body: fmt(en.review.incompleteBody, {
              list: Array.isArray(failure.details.missing_categories)
                ? failure.details.missing_categories.map((item) => item.name).join(', ')
                : '',
            }),
          });
          break;
        case 'RATE_LIMITED':
          setError({
            code: 'RATE_LIMITED',
            tone: 'error',
            title: en.review.rateLimitedTitle,
            body: en.review.rateLimitedBody,
          });
          break;
        default:
          setError({
            code: 'GENERIC',
            tone: 'error',
            title: en.review.errorTitle,
            body: en.review.errorBody,
            requestId: failure.requestId,
          });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function chooseAnother() {
    if (!firstGone) return;
    navigate('/', { state: { focus: firstGone.categoryCode } });
  }

  if (build.selectedCount === 0 && gone.length === 0) {
    return (
      <main className="main">
        <div className="wrap review">
          <div>
            <div className="review__head">
              <span className="eyebrow">{en.review.eyebrow}</span>
              <h1 className="display">{en.review.title}</h1>
              <p className="lede">{en.review.lede}</p>
            </div>
            <div style={{ marginTop: 'var(--s5)' }}>
              <Notice tone="info" title={en.review.emptyTitle}>
                <p>{en.review.emptyBody}</p>
                <p style={{ marginTop: 'var(--s4)' }}>
                  <Link className="btn btn--ghost" to="/">
                    {en.review.emptyAction}
                  </Link>
                </p>
              </Notice>
            </div>
          </div>
          <ReviewAside total={build.total} />
        </div>
      </main>
    );
  }

  const signedOut = authStatus === 'guest';

  return (
    <main className="main">
      <div className="wrap review">
        <div>
          <div className="review__head">
            <span className="eyebrow">{en.review.eyebrow}</span>
            <h1 className="display">{en.review.title}</h1>
            <p className="lede">{en.review.lede}</p>
          </div>

          {error && (
            <div style={{ marginTop: 'var(--s5)' }}>
              <Notice tone={error.tone} title={error.title}>
                <p>{error.body}</p>
                {error.requestId && (
                  <p>{fmt(en.review.reference, { requestId: error.requestId })}</p>
                )}
              </Notice>
            </div>
          )}

          <OrderRows rows={rows} />

          <div className="order-total">
            <span className="label">{en.review.finalTotal}</span>
            <span className="amount num">{formatRupiah(build.total)}</span>
          </div>

          <div className="confirm__actions">
            {signedOut ? (
              <Link
                className="btn"
                to={`${signInHref('/order-review')}&expired=1`}
              >
                {en.review.signInAgain}
              </Link>
            ) : error && error.code === 'UNAUTHENTICATED' ? (
              <Link
                className="btn"
                to={`${signInHref('/order-review')}&expired=1`}
              >
                {en.review.signInAgain}
              </Link>
            ) : error && error.code === 'PART_UNAVAILABLE' && gone.length > 0 ? (
              <button className="btn" type="button" onClick={chooseAnother}>
                {fmt(en.review.chooseAnother, { category: firstGone.categoryName })}
              </button>
            ) : error && error.code === 'BUILD_INCOMPLETE' ? (
              <Link className="btn" to="/">
                {en.review.changePart}
              </Link>
            ) : (
              <>
                <button
                  className="btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !build.complete || catalogueStatus !== 'ready'}
                >
                  {submitting ? en.review.placing : en.review.placeOrder}
                </button>
                <Link className="btn btn--ghost" to="/">
                  {en.review.changePart}
                </Link>
              </>
            )}
          </div>
        </div>

        <ReviewAside total={build.total} />
      </div>
    </main>
  );
}

function ReviewAside({ total }) {
  return (
    <aside className="summary">
      <figure className="summary__figure">
        <img src="/assets/img/gpu-1.webp" alt="" width="1023" height="686" />
      </figure>
      <Seal id="review-seal" />
      <div className="summary__total">
        <span className="label">{en.review.summaryTotal}</span>
        <span className="amount num">{formatRupiah(total)}</span>
      </div>
      <div className="summary__rules">
        {en.review.rules.map((rule) => (
          <p key={rule}>{rule}</p>
        ))}
      </div>
    </aside>
  );
}
