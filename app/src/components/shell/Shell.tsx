import { useAppState } from '@/state/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HomeScreen } from '@/components/screens/home/HomeScreen';
import { CountryScreen } from '@/components/screens/country/CountryScreen';
import { CoachScreen } from '@/components/screens/coach/CoachScreen';
import { VideoScreen } from '@/components/screens/video/VideoScreen';
import { SourcesScreen } from '@/components/screens/sources/SourcesScreen';
import { FeedScreen } from '@/components/screens/feed/FeedScreen';
import { ReportScreen } from '@/components/screens/report/ReportScreen';
import { AddCountryDialog } from '@/components/dialogs/AddCountryDialog';

// Two-column grid (216px sidebar / flex main) — Scout Hub.dc.html line 41.
function ScreenRouter() {
  const state = useAppState();
  switch (state.screen) {
    case 'home':
      return <HomeScreen />;
    case 'country':
      return <CountryScreen />;
    case 'coach':
      return <CoachScreen />;
    case 'video':
      return <VideoScreen />;
    case 'sources':
      return <SourcesScreen />;
    case 'feed':
      return <FeedScreen />;
    case 'report':
      return <ReportScreen />;
    default:
      return null;
  }
}

export function Shell() {
  return (
    <div className="osh-shell">
      <Sidebar />
      <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div
          style={{
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <ScreenRouter />
        </div>
      </main>
      <AddCountryDialog />
    </div>
  );
}
