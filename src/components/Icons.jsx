export function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 0.8 14.55 9.45 23.2 12 14.55 14.55 12 23.2 9.45 14.55 0.8 12 9.45 9.45Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AlertIcon(props) {
  return (
    <svg
      className="notice__icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      {...props}
    >
      <circle cx="8" cy="8" r="6.6" />
      <path d="M8 4.6v4M8 11.2v.4" />
    </svg>
  );
}

export function InfoIcon(props) {
  return (
    <svg
      className="notice__icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      {...props}
    >
      <circle cx="8" cy="8" r="6.6" />
      <path d="M8 5.4v4.2M8 11.6v.4" />
    </svg>
  );
}
