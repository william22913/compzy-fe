import { formatRupiah } from '../helpers/money';
import en from '../locales';

// One row shape for the review table and the confirmation table.
// row: { key, categoryName, partName, priceRupiah, optional, gone }
export function OrderRows({ rows }) {
  return (
    <ul className="order-rows">
      {rows.map((row) => (
        <li
          key={row.key}
          className={[
            'orow',
            row.optional ? 'orow--optional' : '',
            row.gone ? 'orow--gone' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="orow__cat">{row.categoryName}</span>
          <span className="orow__part">
            {row.gone ? (
              <>
                <s>{row.partName}</s> <span className="tag tag--ghost">{en.review.goneTag}</span>
              </>
            ) : (
              row.partName
            )}
          </span>
          <span className="orow__price num">
            {row.gone ? <s>{formatRupiah(row.priceRupiah)}</s> : formatRupiah(row.priceRupiah)}
          </span>
        </li>
      ))}
    </ul>
  );
}
