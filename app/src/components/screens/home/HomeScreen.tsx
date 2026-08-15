import { useAppDispatch, useAppState } from '@/state/AppContext';
import { currentMode, rosterOf } from '@/state/selectors';
import { POOL } from '@/data/pool';
import { flag } from '@/lib/flag';
import { getCountryCollection } from '@/lib/collectedData';
import { SegToggle } from '@/components/primitives/SegToggle';
import { EvenGrid } from './EvenGrid';
import { LanesGrid } from './LanesGrid';
import { Asia20Grid } from './Asia20Grid';
import type { CountryCardData } from './types';

// Ported from Scout Hub.dc.html lines 103-218.
export function HomeScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const m = currentMode(state);
  const roster = rosterOf(state, state.mode);

  const countries: CountryCardData[] = roster.map(([code, comp]) => {
    const c = POOL[code];
    const u = getCountryCollection(state.mode, code).items.length;
    return {
      code,
      ja: c.ja,
      en: c.en,
      rank: c.rank,
      conf: c.conf,
      comp,
      updates: u,
      hasNew: u > 0,
      manage: state.manage,
      flag: flag(code, 160),
      flagSm: flag(code, 40),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <p
          style={{
            maxWidth: '56ch',
            margin: 0,
            fontSize: 13,
            lineHeight: 1.6,
            color: 'color-mix(in srgb,var(--color-text) 70%,transparent)',
          }}
        >
          {m.note}
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
              }}
            >
              配置
            </span>
            <SegToggle
              options={[
                {
                  key: 'a',
                  label: '均等グリッド',
                  active: state.gridVar === 'a',
                  onClick: () => dispatch({ type: 'SET_GRID_VAR', value: 'a' }),
                },
                {
                  key: 'b',
                  label: '大会別レーン',
                  active: state.gridVar === 'b',
                  onClick: () => dispatch({ type: 'SET_GRID_VAR', value: 'b' }),
                },
              ]}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'TOGGLE_MANAGE' })}>
            {state.manage ? '編集を終了' : '国を追加 / 除外'}
          </button>
        </div>
      </div>

      {state.gridVar === 'a' ? <EvenGrid countries={countries} /> : <LanesGrid countries={countries} />}

      <Asia20Grid />
    </div>
  );
}
