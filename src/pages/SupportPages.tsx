import { useState } from 'react';
import { PlaySquare } from 'lucide-react';
import {
  exerciseCorrections,
  exerciseLibrary,
  fundamentals,
  mobilityPrep,
  physicalTrainingLibrary,
  positionGuides,
  sessions,
  styleGuides,
  type PageId,
} from '@/data/volleyball';
import { ScorePill, Section, StatusBadge } from '@/components/Primitives';

interface SupportPageProps {
  page: Exclude<PageId, 'dashboard' | 'treinos' | 'relatorios'>;
}

const courtZones = [
  { zone: 'Z1', label: 'Saque / defesa direita', left: '68%', top: '67%' },
  { zone: 'Z2', label: 'Saida de rede', left: '62%', top: '38%' },
  { zone: 'Z3', label: 'Meio de rede', left: '49%', top: '34%' },
  { zone: 'Z4', label: 'Entrada de rede', left: '36%', top: '39%' },
  { zone: 'Z5', label: 'Defesa esquerda', left: '32%', top: '67%' },
  { zone: 'Z6', label: 'Fundo centro', left: '50%', top: '70%' },
];

export default function SupportPage({ page }: SupportPageProps) {
  const [selectedFundamental, setSelectedFundamental] = useState('Todos');
  const [selectedPositionId, setSelectedPositionId] = useState(positionGuides[0]?.id ?? 'central');
  const fundamentalOptions = ['Todos', ...fundamentals.map((item) => item.name)];
  const visibleExercises = selectedFundamental === 'Todos'
    ? exerciseLibrary
    : exerciseLibrary.filter((exercise) => exercise.fundamental === selectedFundamental);
  const selectedPosition = positionGuides.find((position) => position.id === selectedPositionId) ?? positionGuides[0];

  if (page === 'fisico-mobilidade') {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Section
          title="FISICO E MOBILIDADE"
          action={<span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">{physicalTrainingLibrary.length} blocos</span>}
        >
          <div className="space-y-4 p-4">
            <p className="max-w-3xl text-sm leading-6 text-[var(--isa-soft)]">
              Exercicios fisicos e mobilidades ficam separados do plano semanal para a rotina diaria continuar limpa.
            </p>
            <div className="grid gap-4 2xl:grid-cols-2">
              {physicalTrainingLibrary.map((exercise) => (
                <article key={exercise.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="rounded-md border border-[rgba(69,215,200,0.3)] bg-[rgba(69,215,200,0.08)] px-2 py-1 text-[10px] font-bold text-[var(--isa-teal)]">{exercise.focus}</span>
                    <span className="metric-label">{exercise.duration}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">{exercise.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.objective}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <span className="metric-label">Atletas</span>
                      <p className="mt-2 text-sm font-semibold leading-5 text-white">{exercise.athletes}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <span className="metric-label">Material</span>
                      <p className="mt-2 text-sm font-semibold leading-5 text-white">{exercise.materials}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                    <span className="metric-label">Montagem em quadra</span>
                    <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.setup}</p>
                  </div>
                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                    <span className="metric-label">Mobilidade antes</span>
                    <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.mobility}</p>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                      <span className="metric-label">Variacoes</span>
                      <ul className="mt-2 grid gap-1 pl-5 text-sm leading-6 text-[var(--isa-soft)]">
                        {exercise.variations.map((variation) => <li key={variation}>{variation}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[rgba(255,178,56,0.25)] bg-[rgba(255,178,56,0.06)] p-3">
                      <span className="metric-label">Descanso</span>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">{exercise.rest}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-[rgba(69,215,200,0.22)] bg-[rgba(69,215,200,0.055)] p-3">
                    <span className="metric-label">Metrica</span>
                    <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.metric}</p>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--isa-muted)]">{exercise.evidence}</p>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <aside className="space-y-5">
          <Section title="Mobilidade antes do treino">
            <div className="space-y-3 p-4">
              {mobilityPrep.map((item) => (
                <article key={item.area} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">{item.area}</h3>
                    <span className="metric-label">{item.dose}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5 text-[var(--isa-soft)]">{item.drill}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--isa-muted)]">{item.reason}</p>
                </article>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    );
  }

  if (page === 'posicoes') {
    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Section
            title="Posicoes do volei"
            action={<span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">{positionGuides.length} funcoes</span>}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-wrap gap-2">
                {positionGuides.map((position) => (
                  <button
                    key={position.id}
                    type="button"
                    onClick={() => setSelectedPositionId(position.id)}
                    className={`min-h-10 rounded-lg border px-3 text-left text-xs font-semibold transition ${selectedPosition.id === position.id ? 'border-[var(--isa-line-strong)] bg-[rgba(69,215,200,0.16)] text-[var(--isa-teal)]' : 'border-white/10 bg-white/[0.025] text-[var(--isa-muted)] hover:text-white'}`}
                  >
                    <span className="block text-sm leading-5">{position.name}</span>
                    <span className="block text-[10px] uppercase tracking-[0.16em]">{position.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <article className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="metric-label">Funcao em quadra</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedPosition.name}</h2>
                  </div>
                  <span className="rounded-lg border border-[rgba(255,178,56,0.28)] bg-[rgba(255,178,56,0.08)] px-3 py-2 text-sm font-bold text-[var(--isa-amber)]">
                    {selectedPosition.shortName}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--isa-soft)]">{selectedPosition.role}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                    <span className="metric-label">Base de quadra</span>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">{selectedPosition.courtBase}</p>
                  </div>
                  <div className="rounded-lg border border-[rgba(69,215,200,0.22)] bg-[rgba(69,215,200,0.055)] p-3">
                    <span className="metric-label">Prioridade</span>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">{selectedPosition.priority}</p>
                  </div>
                </div>
              </article>

              <aside className="grid content-start gap-3">
                <div className="rounded-xl border border-[rgba(118,220,110,0.22)] bg-[rgba(118,220,110,0.055)] p-4">
                  <span className="metric-label">Melhor decisao</span>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">{selectedPosition.primaryDecision}</p>
                </div>
                <div className="rounded-xl border border-[rgba(255,106,87,0.22)] bg-[rgba(255,106,87,0.055)] p-4">
                  <span className="metric-label">Evitar</span>
                  <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{selectedPosition.avoid}</p>
                </div>
              </aside>
            </div>
          </Section>

          <Section title="Treino por estilo">
            <div className="grid gap-4 p-4 md:grid-cols-3">
              {selectedPosition.trainingTabs.map((tab) => (
                <article key={tab.label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  <span className="rounded-md border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-2 py-1 text-[10px] font-bold text-[var(--isa-teal)]">{tab.label}</span>
                  <h3 className="mt-4 text-sm font-semibold text-white">{tab.focus}</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">{tab.drill}</p>
                </article>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-5">
          <Section title="Fundamentos-chave">
            <div className="flex flex-wrap gap-2 p-4">
              {selectedPosition.keyFundamentals.map((fundamental) => (
                <span key={fundamental} className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-[var(--isa-soft)]">
                  {fundamental}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Indicadores">
            <div className="space-y-3 p-4">
              {selectedPosition.indicators.map((indicator) => (
                <article key={indicator} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <p className="text-sm leading-6 text-[var(--isa-soft)]">{indicator}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section title="Evidencias para relatorio">
            <div className="space-y-3 p-4">
              {selectedPosition.evidence.map((evidence) => (
                <article key={evidence} className="rounded-lg border border-[rgba(69,215,200,0.18)] bg-[rgba(69,215,200,0.045)] p-3">
                  <p className="text-xs font-semibold leading-5 text-[var(--isa-soft)]">{evidence}</p>
                </article>
              ))}
            </div>
          </Section>
        </aside>
      </div>
    );
  }

  if (page === 'exercicios') {
    return (
      <div className="space-y-5">
        <Section
          title="Biblioteca de exercicios por fundamento"
          action={<span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">{visibleExercises.length} exercicios</span>}
        >
          <div className="p-4">
            <p className="max-w-3xl text-sm leading-6 text-[var(--isa-soft)]">
              Modelos prontos para treinar sozinho em casa, com objetivo, material simples, execucao segura e metrica clara.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {fundamentalOptions.map((fundamental) => (
                <button
                  key={fundamental}
                  type="button"
                  onClick={() => setSelectedFundamental(fundamental)}
                  className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${selectedFundamental === fundamental ? 'border-[var(--isa-line-strong)] bg-[rgba(69,215,200,0.16)] text-[var(--isa-teal)]' : 'border-white/10 bg-white/[0.025] text-[var(--isa-muted)] hover:text-white'}`}
                >
                  {fundamental}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <div className="grid gap-4 xl:grid-cols-2">
          {visibleExercises.map((exercise) => (
            <article key={exercise.id} className="isa-panel grid gap-4 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md border border-[rgba(69,215,200,0.3)] bg-[rgba(69,215,200,0.08)] px-2 py-1 text-[10px] font-bold text-[var(--isa-teal)]">{exercise.fundamental}</span>
                <span className="metric-label">{exercise.duration}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{exercise.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.objective}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)]">
                <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <span className="metric-label">Ambiente</span>
                  <p className="mt-2 text-sm font-semibold leading-5 text-white">{exercise.environment}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <span className="metric-label">Material</span>
                  <p className="mt-2 text-sm font-semibold leading-5 text-white">{exercise.materials}</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <span className="metric-label">Como fazer em casa</span>
                <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.setup}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <span className="metric-label">Variacoes</span>
                <ul className="mt-2 grid gap-1 pl-5 text-sm leading-6 text-[var(--isa-soft)]">
                  {exercise.variations.map((variation) => <li key={variation}>{variation}</li>)}
                </ul>
              </div>
              <div className="rounded-lg border border-[rgba(69,215,200,0.22)] bg-[rgba(69,215,200,0.055)] p-3">
                <span className="metric-label">Metrica</span>
                <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">{exercise.metric}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (page === 'estilos') {
    return (
      <Section title="Estilos de treino">
        <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
          {styleGuides.map((style) => (
            <article key={style.name} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <h2 className="text-lg font-semibold text-white">{style.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--isa-soft)]">{style.focus}</p>
              <p className="mt-4 text-xs leading-5 text-[var(--isa-muted)]">{style.activities}</p>
            </article>
          ))}
        </div>
      </Section>
    );
  }

  if (page === 'individual') {
    return (
      <Section title="Plano individual">
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <th className="table-head py-3">Fundamento</th>
                <th className="table-head py-3">Exercicio</th>
                <th className="table-head py-3">Correcao</th>
                <th className="table-head py-3">Prioridade</th>
                <th className="table-head py-3">Meta</th>
              </tr>
            </thead>
            <tbody>
              {exerciseCorrections.length ? exerciseCorrections.map((item) => (
                <tr key={item.id}>
                  <td className="table-cell font-semibold text-white">{item.fundamental}</td>
                  <td className="table-cell text-[var(--isa-soft)]">{item.exercise}</td>
                  <td className="table-cell text-[var(--isa-soft)]">{item.correction}</td>
                  <td className="table-cell"><StatusBadge status={item.priority} /></td>
                  <td className="table-cell text-[var(--isa-soft)]">{item.target}</td>
                </tr>
              )) : (
                <tr>
                  <td className="table-cell" colSpan={5}>
                    <p className="font-semibold text-white">Nenhuma correcao registrada</p>
                    <p className="text-xs text-[var(--isa-muted)]">Seu plano individual ainda esta limpo.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    );
  }

  if (page === 'indicadores') {
    return (
      <div className="space-y-5">
        <Section title="Tabela de fundamentos">
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {fundamentals.map((item) => (
              <article key={item.name} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white">{item.name}</h2>
                  <ScorePill value={item.score} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${item.score * 10}%`, background: item.color }} />
                </div>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Comparacao por treino">
          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  <th className="table-head py-3">Treino</th>
                  <th className="table-head py-3">Estilo</th>
                  <th className="table-head py-3">Minutos</th>
                  <th className="table-head py-3 text-right">Qualidade</th>
                  <th className="table-head py-3 text-right">Carga</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length ? sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="table-cell font-semibold text-white">{session.title}</td>
                    <td className="table-cell text-[var(--isa-soft)]">{session.style}</td>
                    <td className="table-cell text-[var(--isa-soft)]">{session.duration}</td>
                    <td className="table-cell text-right"><ScorePill value={session.quality} /></td>
                    <td className="table-cell text-right"><StatusBadge status={session.load} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="table-cell" colSpan={5}>
                      <p className="font-semibold text-white">Nenhum treino para comparar</p>
                      <p className="text-xs text-[var(--isa-muted)]">Os indicadores serao preenchidos apenas com seus dados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
        <Section
          title="Mapa de posicionamento em quadra"
          action={<span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">Rotacao base</span>}
        >
          <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#061011] max-[820px]:min-h-[300px]">
              <img
                src="/assets/learning-volleyball-system.png"
                alt="Quadra usada como referencia visual para posicionamento"
                className="h-full min-h-[420px] w-full object-cover max-[820px]:min-h-[300px]"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,17,0.55),rgba(7,16,17,0.06)_50%,rgba(7,16,17,0.5))]" />
              {courtZones.map((item) => (
                <button
                  key={item.zone}
                  type="button"
                  aria-label={`Selecionar zona ${item.zone}: ${item.label} no mapa de posicionamento em quadra`}
                  className="absolute z-10 min-w-[126px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[rgba(69,215,200,0.55)] bg-[rgba(6,16,17,0.78)] px-2.5 py-2 text-left shadow-[0_10px_30px_rgba(0,0,0,0.28),0_0_0_4px_rgba(69,215,200,0.08)] max-[820px]:min-w-[88px]"
                  style={{ left: item.left, top: item.top }}
                >
                  <strong className="block text-[13px] leading-none text-[var(--isa-teal)]">{item.zone}</strong>
                  <span className="mt-1 block text-[11px] leading-tight text-[var(--isa-soft)] max-[820px]:hidden">{item.label}</span>
                </button>
              ))}
            </div>
            <aside className="grid content-start gap-3">
              <article className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <h3 className="text-sm font-semibold text-white">Uso no treino</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">
                  Marcar onde voce deve iniciar a sequencia e comparar com a sua movimentacao real depois do rally.
                </p>
              </article>
              <article className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <h3 className="text-sm font-semibold text-white">Proximo passo</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">
                  Transformar os pontos em arrastar-e-soltar para montar sistemas de recepcao, defesa e cobertura.
                </p>
              </article>
            </aside>
          </div>
        </Section>
      </div>
    );
  }

  const videoSteps = [
    ['Gravar', 'Use angulo simples, boa luz e uma serie curta.'],
    ['Marcar', 'Pause no contato, base, plataforma, passada ou aterrissagem.'],
    ['Registrar', 'Escreva o criterio observado e a proxima correcao.'],
  ];
  const timeline = [
    ['00:03', 'Saque', 'Lancamento saiu a frente do ombro'],
    ['00:05', 'Contato', 'Punho alto e equilibrio depois do toque'],
    ['00:08', 'Fechamento', 'Anotar se a bola chegou no alvo'],
  ];
  const markers = [
    ['Saque', 'Lancamento, braco alto, contato e equilibrio final'],
    ['Recepcao', 'Base baixa, plataforma, angulo dos bracos e direcao'],
    ['Ataque', 'Ritmo da passada, armacao do braco, contato e aterrissagem'],
    ['Bloqueio', 'Passo lateral, fechamento das maos e queda equilibrada'],
    ['Defesa', 'Postura baixa, leitura, deslocamento curto e recuperacao'],
  ];

  return (
    <div className="space-y-5">
      <Section
        title="Videos dos treinos"
        action={<span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">manual</span>}
      >
        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
            <PlaySquare className="h-11 w-11 text-[var(--isa-teal)]" />
            <h2 className="mt-4 text-xl font-semibold text-white">Assista, marque o momento e transforme em evidencia.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--isa-soft)]">
              Por enquanto o video entra como revisao manual: observe o fundamento, marque o detalhe tecnico e leve uma evidencia simples para o relatorio.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {videoSteps.map(([title, detail], index) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(69,215,200,0.35)] bg-[rgba(69,215,200,0.08)] text-xs font-bold text-[var(--isa-teal)]">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">{detail}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="grid content-start gap-3">
            <article className="rounded-lg border border-[rgba(69,215,200,0.22)] bg-[rgba(69,215,200,0.055)] p-4">
              <h3 className="text-sm font-semibold text-white">Criterio de sucesso</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">
                Cada marcacao precisa virar treino util: tempo do video, fundamento, evidencia observada e proxima acao.
              </p>
            </article>
            <article className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
              <h3 className="text-sm font-semibold text-white">Limite atual</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--isa-soft)]">
                Sem analise automatica nesta fase. O foco e criar bons registros manuais antes de automatizar.
              </p>
            </article>
          </aside>
        </div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Section title="Linha do tempo exemplo">
          <div className="space-y-3 p-4">
            {timeline.map(([time, title, detail]) => (
              <article key={`${time}-${title}`} className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[72px_minmax(0,1fr)]">
                <span className="text-sm font-bold text-[var(--isa-teal)]">{time}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--isa-soft)]">{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title="O que marcar">
          <div className="space-y-3 p-4">
            {markers.map(([name, marker]) => (
              <div key={name} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <span className="text-sm font-semibold text-white">{name}</span>
                <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">{marker}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Ficha de evidencia">
        <div className="p-4">
          <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="metric-label">Saque - exemplo manual</p>
                <h3 className="mt-2 text-base font-semibold text-white">Contato com braco alto</h3>
                <p className="mt-1 text-xs text-[var(--isa-muted)]">00:03 - 00:05 / serie 1</p>
              </div>
              <span className="rounded-md border border-[rgba(255,178,56,0.28)] bg-[rgba(255,178,56,0.08)] px-2 py-1 text-[10px] font-semibold text-[var(--isa-amber)]">
                Exemplo
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                <span className="metric-label">Evidencia</span>
                <p className="mt-2 text-sm font-semibold leading-5 text-white">Punho acima da linha do ombro e bola indo para o alvo.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="metric-label">Fonte</span>
                <p className="mt-2 text-sm font-semibold text-[var(--isa-soft)]">Revisao manual</p>
              </div>
              <div className="rounded-lg border border-[rgba(118,220,110,0.2)] bg-[rgba(118,220,110,0.06)] p-3">
                <span className="metric-label">Proxima acao</span>
                <p className="mt-2 text-xs leading-5 text-[var(--isa-soft)]">Repetir com lancamento mais estavel e registrar acertos.</p>
              </div>
            </div>
          </article>
        </div>
      </Section>
    </div>
  );
}
