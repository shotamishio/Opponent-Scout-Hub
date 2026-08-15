import { AppProvider } from '@/state/AppContext';
import { Shell } from '@/components/shell/Shell';

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
