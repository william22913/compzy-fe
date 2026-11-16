import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrderRows } from '../../components/OrderRows';
import { formatDate } from '../../helpers/date';
import { formatRupiah } from '../../helpers/money';
import { useLanguage, useT } from '../../store/LanguageContext';
import { fetchOrder } from '../../core/services/orderService';
import { signInHref } from '../../helpers/returnTo';

export function ConfirmationPage() {
  const { orderId } = useParams();
  const { lang } = useLanguage();
  const t = useT();
  const [state, setState] = useState({ status: 'loading', order: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchOrder(orderId, { signal: controller.signal })
      .then((order) => {
        if (active) setState({ status: order ? 'ready' : 'error', order });
      })
      .catch((failure) => {
        // A missing session is not a missing order: say so, and offer the way
        // back in rather than hinting the order belongs to someone else.
        if (active) setState({ status: 'error', order: null, code: failure && failure.code });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [orderId]);

  if (state.status === 'loading') {
    return (
      <main className="main night">
        <div className="confirm">
          <div>
            <p className="eyebrow" aria-live="polite">
              {t.confirmation.loading}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    const signedOut = state.code === 'UNAUTHENTICATED';
    return (
      <main className="main night">
        <div className="confirm">
          <div>
            <span className="eyebrow">{t.confirmation.eyebrow}</span>
            <h1 className="display">
              {signedOut ? t.confirmation.sessionTitle : t.confirmation.notFoundTitle}
            </h1>
            <p className="lede">
              {signedOut ? t.confirmation.sessionBody : t.confirmation.notFoundBody}
            </p>
            <div className="confirm__actions">
              {signedOut ? (
                <Link
                  className="btn btn--on-night"
                  to={signInHref(`/order-confirmation/${orderId}`)}
                >
                  {t.confirmation.sessionAction}
                </Link>
              ) : (
                <Link className="btn btn--on-night" to="/">
                  {t.confirmation.notFoundAction}
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { order } = state;
  const rows = order.items.map((item) => ({
    key: `${item.categoryCode}-${item.partName}`,
    categoryCode: item.categoryCode,
    categoryName: item.categoryName,
    partName: item.partName,
    priceRupiah: item.unitPriceRupiah,
    optional: item.categoryCode === 'gpu',
  }));

  return (
    <main className="main night">
      <div className="confirm">
        <div>
          <span className="eyebrow">{t.confirmation.eyebrow}</span>
          <h1 className="display">{t.confirmation.title}</h1>
          <p className="lede">{t.confirmation.lede}</p>
          <p className="confirm__ref">
            <span className="label">{t.confirmation.order}</span>
            <span className="display num">{order.id}</span>
          </p>
          <dl className="confirm__meta">
            <div>
              <dt>{t.confirmation.placed}</dt>
              <dd>{formatDate(order.createdAt, lang)}</dd>
            </div>
            <div>
              <dt>{t.confirmation.parts}</dt>
              <dd className="num">{order.items.length}</dd>
            </div>
          </dl>
          <OrderRows rows={rows} />
          <div className="order-total">
            <span className="label">{t.confirmation.finalTotal}</span>
            <span className="amount num">{formatRupiah(order.totalRupiah)}</span>
          </div>
          <div className="confirm__actions">
            <Link className="btn btn--on-night" to="/">
              {t.confirmation.startNew}
            </Link>
          </div>
        </div>
        <aside className="confirm__aside">
          <figure className="confirm__figure">
            <img src="/assets/img/confirm.webp" alt="" width="684" height="1024" />
          </figure>
          <p className="summary__rules">{t.confirmation.aside}</p>
        </aside>
      </div>
    </main>
  );
}
