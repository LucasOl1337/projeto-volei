import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  FileText,
  Gauge,
  LayoutDashboard,
  Library,
  PlaySquare,
  UsersRound,
} from 'lucide-react';
import { navigation, type PageId } from '@/data/volleyball';

interface LayoutProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  children: React.ReactNode;
}

const navIcons: Record<PageId, React.ElementType> = {
  dashboard: LayoutDashboard,
  treinos: CalendarDays,
  posicoes: UsersRound,
  'fisico-mobilidade': Dumbbell,
  relatorios: FileText,
  exercicios: Library,
  estilos: ClipboardList,
  individual: Gauge,
  indicadores: BarChart3,
  videos: PlaySquare,
};

export default function Layout({ activePage, onPageChange, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 980);

  useEffect(() => {
    const sync = () => {
      if (window.innerWidth < 980) setCollapsed(true);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  const hint = navigation.find((item) => item.id === activePage)?.hint ?? 'Projeto Vôlei';

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[var(--isa-bg)]">
      <div className="court-lines pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_45%_12%,rgba(69,215,200,0.12),transparent_34%),radial-gradient(circle_at_88%_64%,rgba(255,178,56,0.08),transparent_36%),linear-gradient(135deg,#071011_0%,#0b1416_52%,#05090a_100%)]" />

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-20 flex h-full shrink-0 flex-col border-r border-white/10 bg-[#061011]/90 shadow-[20px_0_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--isa-line-strong)] bg-[rgba(69,215,200,0.12)]">
            <img src="/assets/site-icon-192.png" alt="" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold leading-tight text-white">Projeto Vôlei</h1>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--isa-muted)]">
                Assistente de treinos
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const Icon = navIcons[item.id];
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item w-full ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                onClick={() => onPageChange(item.id)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-3">
          <div className={`rounded-lg border border-white/10 bg-white/[0.025] p-3 ${collapsed ? 'text-center' : ''}`}>
            <div className="flex items-center gap-2">
              <span className="status-dot bg-[var(--isa-green)]" />
              {!collapsed && <span className="text-xs font-semibold text-[var(--isa-soft)]">Dados pessoais</span>}
            </div>
            {!collapsed && <p className="mt-1 text-[10px] text-[var(--isa-muted)]">Tudo inicia zerado</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0b1718] text-[var(--isa-teal)] transition hover:scale-105"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#071011]/60 px-5 backdrop-blur-xl md:px-8">
          <div className="min-w-0">
            <p className="metric-label truncate">{hint}</p>
            <p className="mt-1 truncate text-sm text-[var(--isa-soft)]">Nenhum treino criado · Seus dados individuais</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-[rgba(69,215,200,0.28)] bg-[rgba(69,215,200,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--isa-teal)]">
              Sem treino ativo
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--isa-muted)]">
              Localhost
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto w-full max-w-[1500px] px-4 py-5 md:px-8 md:py-7"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
