import { Dumbbell, Gauge, Volleyball } from 'lucide-react';
import type { CSSProperties } from 'react';
import { fundamentals, sessions, type TrainingStyle } from '@/data/volleyball';

interface DashboardProps {
  selectedStyle: TrainingStyle | 'Todos';
  onStyleChange: (style: TrainingStyle | 'Todos') => void;
  selectedSessionId: string;
  onSessionSelect: (id: string) => void;
}

export default function Dashboard(_: DashboardProps) {
  const physicalSessions = sessions.filter((session) => session.style === 'Fisico');
  const technicalSessions = sessions.filter((session) => session.style === 'Tecnico');

  const physicalScore = physicalSessions.length
    ? physicalSessions.reduce((sum, session) => sum + session.quality, 0) / physicalSessions.length
    : 0;
  const technicalScore = technicalSessions.length
    ? technicalSessions.reduce((sum, session) => sum + session.quality, 0) / technicalSessions.length
    : 0;
  const fundamentalScore = fundamentals.length
    ? fundamentals.reduce((sum, item) => sum + item.score, 0) / fundamentals.length
    : 0;

  const indicators = [
    {
      label: 'Fisico',
      value: physicalScore,
      detail: `${physicalSessions.length} treinos fisicos registrados`,
      icon: Dumbbell,
      color: 'var(--isa-green)',
    },
    {
      label: 'Tecnico',
      value: technicalScore,
      detail: `${technicalSessions.length} treinos tecnicos registrados`,
      icon: Gauge,
      color: 'var(--isa-teal)',
    },
    {
      label: 'Fundamento',
      value: fundamentalScore,
      detail: 'media geral dos fundamentos',
      icon: Volleyball,
      color: 'var(--isa-amber)',
    },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      {indicators.map((indicator) => {
        const Icon = indicator.icon;
        return (
          <article key={indicator.label} className="isa-panel rounded-xl p-5" style={{ '--indicator-color': indicator.color } as CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="metric-label">{indicator.label}</p>
                <p className="mt-5 text-5xl font-semibold tabular-nums text-white">{indicator.value.toFixed(1)}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--indicator-color)] bg-[color-mix(in_srgb,var(--indicator-color)_14%,transparent)] text-[color:var(--indicator-color)]">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${indicator.value * 10}%`, background: indicator.color }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm leading-5 text-[var(--isa-soft)]">{indicator.detail}</p>
              <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-[var(--isa-muted)]">0-10</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
