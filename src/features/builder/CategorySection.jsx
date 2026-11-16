import { CATEGORY_ART } from '../../helpers/categoryArt';
import { categoryLabel } from '../../helpers/categoryLabel';
import { fmt } from '../../locales';
import { useT } from '../../store/LanguageContext';
import { PartCard } from './PartCard';

export function CategorySection({ category, index, selectedPartId, onChoose }) {
  const t = useT();
  return (
    <section className="cat" id={`cat-${category.code}`}>
      <div className="cat__head">
        <figure className="cat__plate">
          <img src={CATEGORY_ART[category.code] || CATEGORY_ART.cpu} alt="" />
          <span className="oval">{String(index + 1).padStart(2, '0')}</span>
        </figure>
        <h2 className="cat__title display">
          {categoryLabel(t, category.code, category.name)}
        </h2>
        <div className="cat__meta">
          {category.required ? (
            <span className="tag tag--accent">{t.builder.required}</span>
          ) : (
            <span className="tag tag--ghost">{t.builder.optional}</span>
          )}
          <span>{fmt(t.builder.partsCount, { count: category.parts.length })}</span>
        </div>
      </div>
      <p className="cat__note">{t.builder.catNotes[category.code] || ''}</p>
      <div className="parts">
        {category.parts.map((part, partIndex) => (
          <PartCard
            key={part.id}
            part={part}
            lot={partIndex + 1}
            chosen={part.id === selectedPartId}
            onChoose={(partId) => onChoose(category.code, partId)}
          />
        ))}
      </div>
    </section>
  );
}
