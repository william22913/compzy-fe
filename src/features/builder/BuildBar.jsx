import { formatRupiah } from '../../helpers/money';
import en from '../../locales';
import { useBuild } from '../../store/BuildContext';

export function BuildBar({ open, onToggle }) {
  const { total } = useBuild();

  return (
    <div className="build-bar">
      <div>
        <span className="label">{en.builder.total}</span>
        <span className="amount num">{formatRupiah(total)}</span>
      </div>
      <button
        className="btn"
        type="button"
        aria-expanded={open}
        aria-controls="build-panel"
        onClick={onToggle}
      >
        {open ? en.builder.buildBarClose : en.builder.buildBarToggle}
      </button>
    </div>
  );
}
