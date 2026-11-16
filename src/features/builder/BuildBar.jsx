import { formatRupiah } from '../../helpers/money';
import { useT } from '../../store/LanguageContext';
import { useBuild } from '../../store/BuildContext';

export function BuildBar({ open, onToggle }) {
  const { total } = useBuild();
  const t = useT();

  return (
    <div className="build-bar">
      <div>
        <span className="label">{t.builder.total}</span>
        <span className="amount num">{formatRupiah(total)}</span>
      </div>
      <button
        className="btn"
        type="button"
        aria-expanded={open}
        aria-controls="build-panel"
        onClick={onToggle}
      >
        {open ? t.builder.buildBarClose : t.builder.buildBarToggle}
      </button>
    </div>
  );
}
