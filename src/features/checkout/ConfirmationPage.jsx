import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrderRows } from '../../components/OrderRows';
import { formatDate } from '../../helpers/date';
import { formatRupiah } from '../../helpers/money';
import en from '../../locales';
import { fetchOrder } from '../../core/services/orderService';

export function ConfirmationPage() {
  const { orderId } = useParams();
  const [state, setState] = useState({ status: 'loading', order: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchOrder(orderId, { signal: controller.signal })
      .then((order) => {
        if (active) setState({ status: order ? 'ready' : 'error', order });
      })
      .catch(() => {
        if (active) setState({ status: 'error', order: null });
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
              {en.confirmation.loading}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="main night">
        <div className="confirm">
          <div>
            <span className="eyebrow">{en.confirmation.eyebrow}</span>
            <h1 className="display">{en.confirmation.notFoundTitle}</h1>
            <p className="lede">{en.confirmation.notFoundBody}</p>
            <div className="confirm__actions">
              <Link className="btn btn--on-night" to="/">
                {en.confirmation.notFoundAction}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { order } = state;
  const rows = order.items.map((item) => ({
    key: `${item.categoryCode}-${item.partName}`,
    categoryName: item.categoryName,
    partName: item.partName,
    priceRupiah: item.unitPriceRupiah,
    optional: item.categoryCode === 'gpu',
  }));

  return (
    <main className="main night">
      <div className="confirm">
        <div>
          <span className="eyebrow">{en.confirmation.eyebrow}</span>
          <h1 className="display">{en.confirmation.title}</h1>
          <p className="lede">{en.confirmation.lede}</p>
          <p className="confirm__ref">
            <span className="label">{en.confirmation.order}</span>
            <span className="display num">{order.id}</span>
          </p>
          <dl className="confirm__meta">
            <div>
              <dt>{en.confirmation.placed}</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            <div>
              <dt>{en.confirmation.parts}</dt>
              <dd className="num">{order.items.length}</dd>
            </div>
          </dl>
          <OrderRows rows={rows} />
          <div className="order-total">
            <span className="label">{en.confirmation.finalTotal}</span>
            <span className="amount num">{formatRupiah(order.totalRupiah)}</span>
          </div>
          <div className="confirm__actions">
            <Link className="btn btn--on-night" to="/">
              {en.confirmation.startNew}
            </Link>
          </div>
        </div>
        <aside className="confirm__aside">
          <figure className="confirm__figure">
            <img src="/assets/img/confirm.webp" alt="" width="684" height="1024" />
          </figure>
          <p className="summary__rules">{en.confirmation.aside}</p>
        </aside>
      </div>
    </main>
  );
}
