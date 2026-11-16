import { useT } from '../../store/LanguageContext';

export function BuilderSkeleton() {
  const t = useT();
  return (
    <>
      <p className="eyebrow">{t.builder.loadingCatalogue}</p>
      {[0, 1].map((index) => (
        <section className="cat" aria-hidden="true" key={index}>
          <div className="cat__head">
            <span className="skel skel--plate" />
            <span className="skel skel--title" style={{ width: 'min(340px, 42%)' }} />
          </div>
          <div className="parts">
            <div className="skel skel--card" />
            <div className="skel skel--card" />
            <div className="skel skel--card" />
          </div>
        </section>
      ))}
    </>
  );
}
