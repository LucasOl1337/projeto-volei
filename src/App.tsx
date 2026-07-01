import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { navigation, sessions, type PageId, type TrainingStyle } from '@/data/volleyball';
import { usePersistentState } from '@/hooks/usePersistentState';
import Dashboard from '@/pages/Dashboard';
import ReportsPage from '@/pages/ReportsPage';
import SupportPage from '@/pages/SupportPages';
import TrainingPage from '@/pages/TrainingPage';

function App() {
  const [activePage, setActivePage] = usePersistentState<PageId>('activePage', 'dashboard');
  const [selectedStyle, setSelectedStyle] = usePersistentState<TrainingStyle | 'Todos'>('selectedStyle', 'Todos');
  const [selectedSessionId, setSelectedSessionId] = usePersistentState('selectedSessionId', sessions[0]?.id ?? '');
  const activePageExists = navigation.some((item) => item.id === activePage);
  const currentPage = activePageExists ? activePage : 'dashboard';

  useEffect(() => {
    if (!activePageExists) setActivePage('dashboard');
  }, [activePageExists, setActivePage]);

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return (
        <Dashboard
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          selectedSessionId={selectedSessionId}
          onSessionSelect={setSelectedSessionId}
        />
      );
    }

    if (currentPage === 'treinos') {
      return <TrainingPage selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />;
    }

    if (currentPage === 'relatorios') {
      return <ReportsPage />;
    }

    return <SupportPage page={currentPage} />;
  };

  return (
    <Layout activePage={currentPage} onPageChange={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
