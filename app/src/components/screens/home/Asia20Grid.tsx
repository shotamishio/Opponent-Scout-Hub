import { useAppDispatch, useAppState } from '@/state/AppContext';
import { rosterOf, currentMode } from '@/state/selectors';
import { ASIA20 } from '@/data/asia20';
import { POOL } from '@/data/pool';
import { flag } from '@/lib/flag';
import { Tag } from '@/components/primitives/Tag';
import { FlagSwatch } from '@/components/primitives/FlagSwatch';

// Ported from Scout Hub.dc.html lines 189-216 (template) + 1125-1133 (data).
export function Asia20Grid() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const m = currentMode(state);
  const roster = rosterOf(state, state.mode);
  const data = ASIA20[state.mode] || ASIA20.nadeshiko;

  const rows = data.rows.map(([code, years]) => {
    const c = POOL[code];
    return {
      code,
      ja: c.ja,
      en: c.en,
      times: `${years.length}回`,
      years: years.join(' · '),
      flagSm: flag(code, 40),
      inRoster: roster.some((r) => r[0] === code) ? '監視中' : '',
    };
  });

  return (
    <section style={{ marginTop: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          アジア公式戦の対戦国 — 過去20年
        </span>
        <Tag variant="accent">{data.comp}</Tag>
        <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          {data.span} · {data.rows.length}か国
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
      </div>
      <p
        style={{
          margin: '0 0 var(--space-4)',
          maxWidth: '70ch',
          fontSize: 12.5,
          lineHeight: 1.6,
          color: 'color-mix(in srgb,var(--color-text) 68%,transparent)',
        }}
      >
        過去20年間の{data.comp}（本大会）で{m.ja}が対戦した国のみを抽出したグリッドです。年は対戦した大会の開催年。カードをクリックすると同じ国別詳細に入ります（サンプルデータ）。
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))',
          gap: 1,
          background: 'var(--color-divider)',
          border: '1px solid var(--color-divider)',
        }}
      >
        {rows.map((a) => (
          <div
            key={a.code}
            onClick={() => dispatch({ type: 'OPEN_COUNTRY', code: a.code })}
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
                <FlagSwatch src={a.flagSm} en={a.en} width={24} height={16} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, letterSpacing: '.08em', color: 'var(--color-accent-800)' }}>
                  {a.code}
                </span>
              </span>
              <span style={{ fontSize: 10, letterSpacing: '.06em', color: 'var(--color-accent-700)' }}>{a.inRoster}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.1 }}>{a.ja}</div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
              }}
            >
              {a.en}
            </div>
            <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
                }}
              >
                対戦 <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-text)' }}>{a.times}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, letterSpacing: '.04em', color: 'var(--color-accent-700)' }}>
                {a.years}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
