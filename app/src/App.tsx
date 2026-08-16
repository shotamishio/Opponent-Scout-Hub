import { AppProvider } from '@/state/AppContext';
import { CollectedProvider } from '@/state/CollectedContext';
import { Shell } from '@/components/shell/Shell';

export default function App() {
  return (
    <CollectedProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </CollectedProvider>
  );
}
