import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, Save } from 'lucide-react';
import { reports, sessions } from '@/data/volleyball';
import { Section, StatusBadge } from '@/components/Primitives';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(reports[0]?.id ?? null);
  const [note, setNote] = useState('');
  const report = useMemo(() => reports.find((item) => item.id === selectedReport), [selectedReport]);
  const reportTitle = report?.title ?? 'Relatorio individual';

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Section title="Relatorios">
        <div className="divide-y divide-white/10">
          {reports.length ? reports.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedReport(item.id)}
              className={`block w-full p-4 text-left transition hover:bg-white/[0.025] ${selectedReport === item.id ? 'bg-[rgba(69,215,200,0.07)]' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--isa-muted)]">{item.updatedAt}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--isa-soft)]">{item.summary}</p>
            </button>
          )) : (
            <div className="p-4">
              <p className="font-semibold text-white">Nenhum relatorio</p>
              <p className="mt-1 text-xs text-[var(--isa-muted)]">Crie seu primeiro relatorio individual quando terminar um treino.</p>
            </div>
          )}
        </div>
      </Section>

      <div className="space-y-5">
        <Section
          title={reportTitle}
          action={<button type="button" className="btn-primary h-9 px-3 text-xs"><Save className="h-4 w-4" />Salvar</button>}
        >
          <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {!report && (
                <div className="rounded-lg border border-[rgba(69,215,200,0.22)] bg-[rgba(69,215,200,0.055)] p-4">
                  <p className="text-sm font-semibold text-white">Pronto para o primeiro registro</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">
                    Use este rascunho para transformar observacoes do treino em evidencia antes de gerar um relatorio salvo.
                  </p>
                </div>
              )}
              <label className="block">
                <span className="metric-label">Resumo do treino</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Exemplo: recepcao com boa plataforma, mas perda de direcao nas bolas curtas."
                  className="mt-2 min-h-36 w-full resize-none rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white outline-none focus:border-[var(--isa-line-strong)]"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                {['Pontos positivos', 'Pontos de atencao', 'Proximas acoes', 'Correcoes individuais'].map((label) => (
                  <label key={label} className="block">
                    <span className="metric-label">{label}</span>
                    <textarea className="mt-2 min-h-28 w-full resize-none rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white outline-none focus:border-[var(--isa-line-strong)]" />
                  </label>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--isa-teal)]" />
                  <h3 className="text-sm font-semibold text-white">Treino associado</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {sessions.length ? sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="text-sm font-semibold text-white">{session.title}</p>
                      <p className="mt-1 text-xs text-[var(--isa-muted)]">{session.date} · {session.focus}</p>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="text-sm font-semibold text-white">Nenhum treino associado</p>
                      <p className="mt-1 text-xs text-[var(--isa-muted)]">Os relatorios comecam sem dados.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-[rgba(118,220,110,0.25)] bg-[rgba(118,220,110,0.06)] p-4">
                <div className="flex items-center gap-2 text-[var(--isa-green)]">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Checklist pronto</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">
                  Estrutura preparada para virar relatorio exportavel e, no futuro, receber evidencias de video.
                </p>
              </div>
            </aside>
          </div>
        </Section>
      </div>
    </div>
  );
}
