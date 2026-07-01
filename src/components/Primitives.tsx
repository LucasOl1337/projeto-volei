import type { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, action, children, className = '' }: SectionProps) {
  return (
    <section className={`isa-panel rounded-xl ${className}`}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  accent?: 'teal' | 'amber' | 'green' | 'coral' | 'blue';
}

const accentMap = {
  teal: 'var(--isa-teal)',
  amber: 'var(--isa-amber)',
  green: 'var(--isa-green)',
  coral: 'var(--isa-coral)',
  blue: 'var(--isa-blue)',
};

export function MetricCard({ icon: Icon, label, value, detail, accent = 'teal' }: MetricCardProps) {
  const color = accentMap[accent];

  return (
    <div className="isa-panel rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="metric-label">{label}</p>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border" style={{ color, borderColor: `${color}55`, background: `${color}17` }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--isa-muted)]">{detail}</p>
    </div>
  );
}

export function ScorePill({ value }: { value: number }) {
  const color = value >= 8.2 ? 'var(--isa-green)' : value >= 7.6 ? 'var(--isa-amber)' : 'var(--isa-coral)';
  return (
    <span className="inline-flex min-w-12 justify-end text-sm font-semibold tabular-nums" style={{ color }}>
      {value.toFixed(1)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === 'Pendente'
    ? 'var(--isa-coral)'
    : status === 'Concluido'
      ? 'var(--isa-green)'
      : 'var(--isa-amber)';

  return (
    <span className="rounded-md border px-2 py-1 text-[10px] font-semibold" style={{ borderColor: `${color}44`, color, background: `${color}12` }}>
      {status}
    </span>
  );
}
