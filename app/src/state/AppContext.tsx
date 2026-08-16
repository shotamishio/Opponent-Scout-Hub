import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { appReducer, type AppAction } from './appReducer';
import { createInitialState, type AppState } from './types';
import { saveRoster } from './rosterStorage';
import { useVideoAnalysis } from './useVideoAnalysis';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  useVideoAnalysis(state, dispatch);
  // Persist the watch list on every change, so a country added by hand
  // survives a reload and stays until it is removed.
  useEffect(() => saveRoster(state.roster), [state.roster]);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext used outside <AppProvider>');
  return ctx;
}

export function useAppState(): AppState {
  return useAppContext().state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  return useAppContext().dispatch;
}
