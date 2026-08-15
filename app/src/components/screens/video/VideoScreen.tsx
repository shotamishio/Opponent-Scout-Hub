import { useAppState } from '@/state/AppContext';
import { countryData } from '@/lib/countryData';
import { VideoInputCard } from './VideoInputCard';
import { VideoProgressCard } from './VideoProgressCard';
import { VideoResultsPanel } from './VideoResultsPanel';
import { TranscriptPanel } from './TranscriptPanel';

// Ported from Scout Hub.dc.html lines 508-602. The simulated analysis timer
// itself lives in state/useVideoAnalysis.ts, mounted at the provider level
// so it keeps running if the user navigates away from this screen.
export function VideoScreen() {
  const state = useAppState();
  const cur = countryData(state.code);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 1180 }}>
      <VideoInputCard currentJa={cur.ja} />

      {state.video === 'run' && <VideoProgressCard />}

      {state.video === 'done' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)', gap: 'var(--space-6)' }}>
          <VideoResultsPanel coachName={cur.coach.name} countryJa={cur.ja} />
          <TranscriptPanel />
        </div>
      )}
    </div>
  );
}
