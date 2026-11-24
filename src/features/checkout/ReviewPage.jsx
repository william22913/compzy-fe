import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice } from '../../components/Notice';
import { appUrl } from '../../core/base';
import { OrderRows } from '../../components/OrderRows';
import { Seal } from '../../components/Seal';
import { formatRupiah } from '../../helpers/money';
import { signInHref } from '../../helpers/returnTo';
import { categoryLabel } from '../../helpers/categoryLabel';
import { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { useT } from '../../store/LanguageContext';
import { placeOrder } from '../../core/services/orderService';

export function ReviewPage() {
  const { status: authStatus, expireSession } = useAuth();
  const t = useT();
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
        categoryName: categoryLabel(t, category.code, category.name),
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
          setError({ code: 'UNAUTHENTICATED' });
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
          setError({ code: 'PART_UNAVAILABLE' });
          break;
        }
        case 'TOTAL_CHANGED':
          await reload();
          setError({ code: 'TOTAL_CHANGED' });
          break;
        case 'BUILD_INCOMPLETE':
          setError({
            code: 'BUILD_INCOMPLETE',
            missing: Array.isArray(failure.details.missing_categories)
              ? failure.details.missing_categories
              : [],
          });
          break;
        case 'RATE_LIMITED':
          setError({ code: 'RATE_LIMITED' });
          break;
        default:
          setError({ code: 'GENERIC', requestId: failure.requestId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // The notice keeps the failure and is written out at render time, so it
  // follows the language when the customer switches (REQ-043).
  function noticeFor(failure) {
    if (!failure) return null;
    const first = gone[0];
    switch (failure.code) {
      case 'UNAUTHENTICATED':
        return { tone: 'info', title: t.review.sessionTitle, body: t.review.sessionBody };
      case 'PART_UNAVAILABLE':
        return gone.length > 1
          ? { tone: 'error', title: t.review.partGoneManyTitle, body: t.review.partGoneManyBody }
          : {
              tone: 'error',
              title: fmt(t.review.partGoneTitle, { name: first ? first.partName : '' }),
              body: fmt(t.review.partGoneBody, {
                category: first ? categoryLabel(t, first.categoryCode, first.categoryName) : '',
              }),
            };
      case 'TOTAL_CHANGED':
        return { tone: 'error', title: t.review.totalChangedTitle, body: t.review.totalChangedBody };
      case 'BUILD_INCOMPLETE':
        return {
          tone: 'error',
          title: t.review.incompleteTitle,
          body: fmt(t.review.incompleteBody, {
            list: (failure.missing || [])
              .map((item) => categoryLabel(t, item.code, item.name))
              .join(', '),
          }),
        };
      case 'RATE_LIMITED':
        return {
          tone: 'error',
          title: t.review.rateLimitedTitle,
          body: t.review.rateLimitedBody,
        };
      default:
        return { tone: 'error', title: t.review.errorTitle, body: t.review.errorBody };
    }
  }

  function chooseAnother() {
    if (!firstGone) return;
    build.markRemoved({
      categoryCode: firstGone.categoryCode,
      categoryName: firstGone.categoryName,
    });
    navigate('/', { state: { focus: firstGone.categoryCode } });
  }

  if (build.selectedCount === 0 && gone.length === 0) {
    return (
      <main className="main">
        <div className="wrap review">
          <div>
            <div className="review__head">
              <span className="eyebrow">{t.review.eyebrow}</span>
              <h1 className="display">{t.review.title}</h1>
              <p className="lede">{t.review.lede}</p>
            </div>
            <div style={{ marginTop: 'var(--s5)' }}>
              <Notice tone="info" title={t.review.emptyTitle}>
                <p>{t.review.emptyBody}</p>
                <p style={{ marginTop: 'var(--s4)' }}>
                  <Link className="btn btn--ghost" to="/">
                    {t.review.emptyAction}
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
  const notice = noticeFor(error);

  return (
    <main className="main">
      <div className="wrap review">
        <div>
          <div className="review__head">
            <span className="eyebrow">{t.review.eyebrow}</span>
            <h1 className="display">{t.review.title}</h1>
            <p className="lede">{t.review.lede}</p>
          </div>

          {notice && (
            <div style={{ marginTop: 'var(--s5)' }}>
              <Notice tone={notice.tone} title={notice.title}>
                <p>{notice.body}</p>
                {error.requestId && (
                  <p>{fmt(t.review.reference, { requestId: error.requestId })}</p>
                )}
              </Notice>
            </div>
          )}

          <OrderRows rows={rows} />

          <div className="order-total">
            <span className="label">{t.review.finalTotal}</span>
            <span className="amount num">{formatRupiah(build.total)}</span>
          </div>

          <div className="confirm__actions">
            {signedOut ? (
              <Link
                className="btn"
                to={`${signInHref('/order-review')}&expired=1`}
              >
                {t.review.signInAgain}
              </Link>
            ) : error && error.code === 'UNAUTHENTICATED' ? (
              <Link
                className="btn"
                to={`${signInHref('/order-review')}&expired=1`}
              >
                {t.review.signInAgain}
              </Link>
            ) : error && error.code === 'PART_UNAVAILABLE' && gone.length > 0 ? (
              <button className="btn" type="button" onClick={chooseAnother}>
                {fmt(t.review.chooseAnother, {
                  category: categoryLabel(t, firstGone.categoryCode, firstGone.categoryName),
                })}
              </button>
            ) : error && error.code === 'BUILD_INCOMPLETE' ? (
              <Link className="btn" to="/">
                {t.review.changePart}
              </Link>
            ) : (
              <>
                <button
                  className="btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !build.complete || catalogueStatus !== 'ready'}
                >
                  {submitting ? t.review.placing : t.review.placeOrder}
                </button>
                {/* The design offers no way out of the review while it submits. */}
                {!submitting && (
                  <Link className="btn btn--ghost" to="/">
                    {t.review.changePart}
                  </Link>
                )}
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
  const t = useT();
  return (
    <aside className="summary">
      <figure className="summary__figure">
        <img src={appUrl('assets/img/gpu-1.webp')} alt="" width="1023" height="686" />
      </figure>
      <Seal id="review-seal" />
      <div className="summary__total">
        <span className="label">{t.review.summaryTotal}</span>
        <span className="amount num">{formatRupiah(total)}</span>
      </div>
      <div className="summary__rules">
        {t.review.rules.map((rule) => (
          <p key={rule}>{rule}</p>
        ))}
      </div>
    </aside>
  );
}
