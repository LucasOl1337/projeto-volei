import { Plus, Save } from 'lucide-react';
import {
  sessions,
  styleGuides,
  type TrainingStyle,
} from '@/data/volleyball';
import { ScorePill, Section } from '@/components/Primitives';

interface TrainingPageProps {
  selectedStyle: TrainingStyle | 'Todos';
  onStyleChange: (style: TrainingStyle | 'Todos') => void;
}

const styles: Array<TrainingStyle | 'Todos'> = ['Todos', 'Tecnico', 'Tatico', 'Fisico'];
const styleLabels: Record<TrainingStyle | 'Todos', string> = {
  Todos: 'Todos',
  Tecnico: 'Tecnico',
  Tatico: 'Tatico',
  Fisico: 'Fisico',
};

export default function TrainingPage({ selectedStyle, onStyleChange }: TrainingPageProps) {
  const filtered = selectedStyle === 'Todos' ? sessions : sessions.filter((session) => session.style === selectedStyle);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        <Section
          title="Grade de treinos"
          action={<button type="button" className="btn-primary h-9 px-3 text-xs"><Plus className="h-4 w-4" />Novo treino</button>}
        >
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onStyleChange(style)}
                  className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${selectedStyle === style ? 'border-[var(--isa-line-strong)] bg-[rgba(69,215,200,0.16)] text-[var(--isa-teal)]' : 'border-white/10 text-[var(--isa-muted)] hover:text-white'}`}
                >
                  {styleLabels[style]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="table-head py-3">Sessao</th>
                  <th className="table-head py-3">Estilo</th>
                  <th className="table-head py-3">Objetivo</th>
                  <th className="table-head py-3">Duracao</th>
                  <th className="table-head py-3 text-right">Qualidade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((session) => (
                  <tr key={session.id}>
                    <td className="table-cell">
                      <p className="font-semibold text-white">{session.title}</p>
                      <p className="text-xs text-[var(--isa-muted)]">{session.date} - {session.weekday}</p>
                    </td>
                    <td className="table-cell text-[var(--isa-soft)]">{session.style}</td>
                    <td className="table-cell text-[var(--isa-soft)]">{session.focus}</td>
                    <td className="table-cell text-[var(--isa-soft)]">{session.duration} min</td>
                    <td className="table-cell text-right"><ScorePill value={session.quality} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="table-cell" colSpan={5}>
                      <p className="font-semibold text-white">Nenhum treino registrado</p>
                      <p className="text-xs text-[var(--isa-muted)]">Seu historico individual comeca vazio.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

      </div>

      <aside className="space-y-5">
        <Section title="Cadastro rapido">
          <form className="space-y-4 p-4">
            <label className="block">
              <span className="metric-label">Nome do treino</span>
              <input className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-[var(--isa-line-strong)]" defaultValue="" />
            </label>
            <label className="block">
              <span className="metric-label">Estilo</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {styles.filter((style) => style !== 'Todos').map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`min-h-10 rounded-lg border px-3 text-xs font-semibold transition ${style === 'Fisico' ? 'border-[var(--isa-line-strong)] bg-[rgba(69,215,200,0.14)] text-[var(--isa-teal)]' : 'border-white/10 bg-white/[0.035] text-[var(--isa-soft)] hover:border-[var(--isa-line-strong)] hover:text-[var(--isa-teal)]'}`}
                  >
                    {styleLabels[style]}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="metric-label">Objetivo</span>
              <textarea className="mt-2 min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white outline-none focus:border-[var(--isa-line-strong)]" defaultValue="" />
            </label>
            <button type="button" className="btn-primary w-full">
              <Save className="h-4 w-4" />
              Salvar rascunho
            </button>
          </form>
        </Section>

        <Section title="Modelos por estilo">
          <div className="space-y-3 p-4">
            {styleGuides.slice(0, 4).map((style) => (
              <article key={style.name} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <h3 className="text-sm font-semibold text-white">{style.name}</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--isa-soft)]">{style.focus}</p>
              </article>
            ))}
          </div>
        </Section>

      </aside>
    </div>
  );
}
