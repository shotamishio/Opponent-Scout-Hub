import { useAppDispatch } from '@/state/AppContext';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';
import type { CountryCardData } from './types';

interface EvenGridProps {
  countries: CountryCardData[];
}

// Ported from Scout Hub.dc.html lines 119-150.
export function EvenGrid({ countries }: EvenGridProps) {
  const dispatch = useAppDispatch();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(212px,1fr))',
        gap: 'var(--space-6) var(--space-6)',
      }}
    >
      {countries.map((c) => (
        <div
          key={c.code}
          className="card blueprint osh-card-hover-tint"
          onClick={() => dispatch({ type: 'OPEN_COUNTRY', code: c.code })}
          style={{ cursor: 'pointer', gap: 'var(--space-3)', padding: 'var(--space-4)' }}
        >
          <BlueprintFrame />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FlagSwatch src={c.flag} en={c.en} width={44} height={30} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, letterSpacing: '.08em', color: 'var(--color-accent-800)' }}>
                {c.code}
              </span>
            </div>
            {c.hasNew && (
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 11,
                  letterSpacing: '.06em',
                  padding: '3px 7px',
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                }}
              >
                NEW {c.updates}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, lineHeight: 1.1 }}>{c.ja}</div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
              }}
            >
              {c.en}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderTop: '1px solid var(--color-divider)',
              paddingTop: 'var(--space-2)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
              }}
            >
              FIFA rank
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>{c.rank}</span>
          </div>
          {c.manage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'REMOVE_COUNTRY', code: c.code });
              }}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: 12, padding: 4 }}
            >
              この国を除外
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => dispatch({ type: 'OPEN_ADD' })}
        className="osh-dashed-hover"
        style={{
          cursor: 'pointer',
          minHeight: 168,
          border: '1px dashed color-mix(in srgb,var(--color-text) 30%,transparent)',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'var(--font-heading)',
          fontSize: 15,
          color: 'color-mix(in srgb,var(--color-text) 60%,transparent)',
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>＋</span>対戦国を追加
      </button>
    </div>
  );
}
