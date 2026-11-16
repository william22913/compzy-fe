import { useT } from '../store/LanguageContext';

export function Seal({ id = 'seal' }) {
  const t = useT();
  const pathId = `${id}-path`;
  return (
    <div className="seal">
      <svg viewBox="0 0 110 110" aria-hidden="true">
        <defs>
          <path
            id={pathId}
            d="M55,55 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"
          />
        </defs>
        <circle cx="55" cy="55" r="52" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="55" cy="55" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <text>
          <textPath href={`#${pathId}`} startOffset="0">
            {t.chrome.sealText}{' '}
          </textPath>
        </text>
        <path
          d="M55 46.5 57.4 52.6 63.5 55 57.4 57.4 55 63.5 52.6 57.4 46.5 55 52.6 52.6Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
