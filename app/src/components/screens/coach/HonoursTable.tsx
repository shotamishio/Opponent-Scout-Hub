import type { Coach } from '@/lib/coach';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';
import { Tag } from '@/components/primitives/Tag';

interface HonoursTableProps {
  coach: Coach;
}

// Ported from Scout Hub.dc.html lines 474-485.
export function HonoursTable({ coach }: HonoursTableProps) {
  return (
    <section className="card blueprint" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <BlueprintFrame />
      <h4 style={{ margin: 0 }}>主な実績</h4>
      <table className="table">
        <thead>
          <tr>
            <th>大会</th>
            <th style={{ width: 74 }}>年</th>
            <th style={{ width: 90 }}>結果</th>
          </tr>
        </thead>
        <tbody>
          {coach.honours.map((h, i) => (
            <tr key={i}>
              <td style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>{h.comp}</td>
              <td style={{ fontSize: 13 }}>{h.year}</td>
              <td>
                <Tag variant="accent">{h.result}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
