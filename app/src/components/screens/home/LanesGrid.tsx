import { useAppDispatch } from '@/state/AppContext';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';
import type { CountryCardData } from './types';
import type { RosterGroup } from '@/types';

interface LanesGridProps {
  countries: CountryCardData[];
}

// Ported from Scout Hub.dc.html lines 152-187. gLabels: line 1042.
const G_LABELS: Record<RosterGroup, string> = {
  WC: 'World Cup 出場国',
  OLY: 'Olympic 出場国',
  AFC: 'AFC 予選 対戦国',
  ADD: '追加した国',
};
const G_ORDER: RosterGroup[] = ['WC', 'OLY', 'AFC', 'ADD'];

export function LanesGrid({ countries }: LanesGridProps) {
  const dispatch = useAppDispatch();
  const groups = G_ORDER.map((g) => ({
    key: g,
    label: G_LABELS[g],
    items: countries.filter((c) => c.comp === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {groups.map((g) => (
        <section key={g.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {g.label}
            </span>
            <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
              {g.items.length} nations
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
              gap: 1,
              background: 'var(--color-divider)',
              border: '1px solid var(--color-divider)',
            }}
          >
            {g.items.map((c) => (
              <div
                key={c.code}
                onClick={() => dispatch({ type: 'OPEN_COUNTRY', code: c.code })}
                className="osh-row-hover"
                style={{
                  cursor: 'pointer',
                  background: 'var(--color-bg)',
                  padding: 'var(--space-3) var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FlagSwatch src={c.flagSm} en={c.en} width={24} height={16} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, letterSpacing: '.08em', color: 'var(--color-accent-800)' }}>
                      {c.code}
                    </span>
                  </span>
                  {c.hasNew && (
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-heading)',
                        padding: '1px 5px',
                        background: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                      }}
                    >
                      {c.updates}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.1 }}>{c.ja}</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontSize: 10,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
                  }}
                >
                  <span>{c.en}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-text)' }}>{c.rank}</span>
                </div>
                {c.manage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'REMOVE_COUNTRY', code: c.code });
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: 2 }}
                  >
                    除外
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => dispatch({ type: 'OPEN_ADD' })}
              className="osh-text-hover"
              style={{
                cursor: 'pointer',
                background: 'var(--color-bg)',
                border: 0,
                borderLeft: '1px dashed var(--color-divider)',
                padding: 'var(--space-3)',
                fontFamily: 'var(--font-heading)',
                fontSize: 13,
                color: 'color-mix(in srgb,var(--color-text) 55%,transparent)',
              }}
            >
              ＋ 追加
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
