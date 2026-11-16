import { formatRupiah } from '../../helpers/money';
import en, { fmt } from '../../locales';

export function PartCard({ part, lot, chosen, onChoose }) {
  return (
    <article className={`part${chosen ? ' is-chosen' : ''}`}>
      <div className="part__body">
        <span className="part__lot" aria-hidden="true">
          {fmt(en.builder.partLot, { number: String(lot).padStart(2, '0') })}
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
        {chosen ? en.builder.remove : en.builder.choose}
      </button>
    </article>
  );
}
