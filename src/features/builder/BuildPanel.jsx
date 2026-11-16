import { formatRupiah } from '../../helpers/money';
import { categoryLabel } from '../../helpers/categoryLabel';
import { fmt } from '../../locales';
import { useT } from '../../store/LanguageContext';
import { useBuild } from '../../store/BuildContext';

export function BuildPanel({ catalogueStatus, onCheckout, open }) {
  const { rows, selectedCount, total, missing, removePart } = useBuild();
  const t = useT();
  const ready = catalogueStatus === 'ready';

  return (
    <aside
      className={`panel${open ? ' is-open' : ''}`}
      id="build-panel"
      aria-label={t.builder.panelTitle}
    >
      <div className="panel__head">
        <h2 className="display">{t.builder.panelTitle}</h2>
        {ready && (
          <span className="label">
            {fmt(t.builder.panelCount, { chosen: selectedCount, total: rows.length })}
          </span>
        )}
      </div>

      {ready ? (
        <div className="panel__rows">
          {rows.map(({ category, part }) => (
            <div className="prow" key={category.code}>
              <div>
                <span className="prow__cat">
                  {categoryLabel(t, category.code, category.name)}
                </span>
                {part ? (
                  <>
                    <div className="prow__part">{part.name}</div>
                    <button
                      className="prow__remove"
                      type="button"
                      onClick={() => removePart(category.code)}
                    >
                      {t.builder.remove}
                    </button>
                  </>
                ) : (
                  <div className="prow__part none">{t.builder.notChosen}</div>
                )}
              </div>
              <div className="prow__price num">
                {part ? formatRupiah(part.priceRupiah) : '-'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel__rows" aria-hidden="true">
          <div className="skel skel--line" />
          <div className="skel skel--line" />
          <div className="skel skel--line" />
        </div>
      )}

      <div className="panel__total">
        <span className="label">{t.builder.total}</span>
        <span className="amount num">{ready ? formatRupiah(total) : '-'}</span>
      </div>

      {ready ? (
        <>
          <p className={missing.length ? 'panel__need' : 'panel__fine'}>
            {missing.length
              ? fmt(t.builder.need, {
                  list: missing
                    .map((row) => categoryLabel(t, row.category.code, row.category.name))
                    .join(', '),
                })
              : t.builder.needDone}
          </p>
          <button className="btn btn--block" type="button" onClick={onCheckout}>
            {t.builder.checkout}
          </button>
          <p className="panel__fine">{t.builder.panelFine}</p>
        </>
      ) : (
        <p className="panel__fine">{t.builder.loadingTotal}</p>
      )}
    </aside>
  );
}
