import { useEffect } from 'react';
import type { Dispatch } from 'react';
import type { AppState } from './types';
import type { AppAction } from './appReducer';

/**
 * Ported from Scout Hub.dc.html's analyze() (lines 1158-1162). In the source
 * this setTimeout chain lives on the single shared component, so it keeps
 * advancing even if the user navigates to another sidebar section and back.
 * Mounted once at the provider level (not inside VideoScreen) to reproduce
 * that — unmounting the video screen must not kill the simulated progress.
 */
export function useVideoAnalysis(state: AppState, dispatch: Dispatch<AppAction>) {
  useEffect(() => {
    if (state.video !== 'run') return;
    const stepTimers = [1, 2, 3].map((step, i) =>
      setTimeout(() => dispatch({ type: 'SET_VIDEO_STEP', step }), 700 * (i + 1)),
    );
    const doneTimer = setTimeout(() => dispatch({ type: 'FINISH_ANALYZE' }), 3000);
    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [state.video, dispatch]);
}
