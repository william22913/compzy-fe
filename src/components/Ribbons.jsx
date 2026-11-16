import { Fragment } from 'react';
import { StarIcon } from './Icons';

function Track({ items }) {
  return (
    <div className="ribbon__track">
      {[0, 1, 2].map((repeat) => (
        <span key={repeat}>
          {items.map((text, index) => (
            <Fragment key={index}>
              {text}
              <StarIcon />
            </Fragment>
          ))}
        </span>
      ))}
    </div>
  );
}

export function Ribbons({ dark, blush }) {
  return (
    <div className="ribbons" aria-hidden="true">
      <div className="ribbons__band">
        <div className="ribbon ribbon--dark">
          <Track items={dark} />
          <Track items={dark} />
        </div>
        <div className="ribbon ribbon--blush">
          <Track items={blush} />
          <Track items={blush} />
        </div>
      </div>
    </div>
  );
}
