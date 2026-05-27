const CERT_COLORS: Record<string, string> = {
  '무농약': 'bg-primary-fixed text-on-primary-fixed',
  '유기농': 'bg-tertiary-fixed text-on-tertiary-fixed',
  'GAP인증': 'bg-primary-container text-on-primary-container',
  '친환경': 'bg-tertiary-container text-on-tertiary-container',
};

interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className = '' }: BadgeProps) {
  const colorClass = CERT_COLORS[label] ?? 'bg-primary-fixed text-on-primary-fixed';
  return (
    <span
      className={`inline-block px-sm py-xs rounded-full font-label-sm text-label-sm whitespace-nowrap ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
