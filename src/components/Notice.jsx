import { AlertIcon, InfoIcon } from './Icons';

export function Notice({ tone = 'info', title, children }) {
  const Icon = tone === 'error' ? AlertIcon : InfoIcon;
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon />
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  );
}
