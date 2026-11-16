import { formatRupiah } from '../../helpers/money';
import { fmt } from '../../locales';
import { useT } from '../../store/LanguageContext';

export function PartCard({ part, lot, chosen, onChoose }) {
  const t = useT();
  return (
    <article className={`part${chosen ? ' is-chosen' : ''}`}>
      <div className="part__body">
        <span className="part__lot" aria-hidden="true">
          {fmt(t.builder.partLot, { number: String(lot).padStart(2, '0') })}
        </span>
        <h3 className="part__name">{part.name}</h3>
        <div className="part__row">
          <span className="part__price num">{formatRupiah(part.priceRupiah)}</span>
        </div>
      </div>
      <button
        className="part__choose"
        type="button"
        aria-pressed={chosen}
        onClick={() => onChoose(part.id)}
      >
        {chosen ? t.builder.remove : t.builder.choose}
      </button>
    </article>
  );
}
