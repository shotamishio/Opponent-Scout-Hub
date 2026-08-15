import { safeHref, type CollectedCoach } from '@/lib/collectedData';
import { BlueprintFrame } from '@/components/primitives/BlueprintFrame';

interface CoachSourcesProps {
  coach: CollectedCoach;
  countryEn: string;
}

// The "go and read it yourself" panel. Every link opens a page that carries
// the coach's name and career — which is the point of the screen: the app
// should hand the analyst the sources, not a summary they have to trust.
//
// The two search links are included even when the Wikipedia lookup succeeded,
// because Wikipedia lags on appointments and a scout needs the current story
// as well as the biography.
export function CoachSources({ coach, countryEn }: CoachSourcesProps) {
  const searchTerm = coach.name ?? `${countryEn} women's national football team head coach`;
  const links: { label: string; note: string; href: string }[] = [];

  if (coach.federationUrl) {
    links.push({
      label: '協会公式サイト',
      note: '就任・招集の一次情報（T1）',
      href: coach.federationUrl,
    });
  }
  if (coach.profileUrl) {
    links.push({ label: 'Wikipedia — 監督の経歴', note: '本人の記事（経歴・実績）', href: coach.profileUrl });
  }
  if (coach.teamUrl) {
    links.push({ label: 'Wikipedia — チーム', note: '代表チームの記事（歴代監督・成績）', href: coach.teamUrl });
  }
  links.push({
    label: 'Google ニュース検索',
    note: '最新の関連報道をその場で検索',
    href: `https://news.google.com/search?q=${encodeURIComponent(`"${searchTerm}" (football OR soccer)`)}`,
  });
  links.push({
    label: 'Wikipedia 内を検索',
    note: '別表記・同名記事を探す場合',
    href: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchTerm)}`,
  });

  return (
    <div
      className="card blueprint"
      style={{ marginLeft: 'auto', padding: 'var(--space-4)', minWidth: 260, maxWidth: 320, gap: 'var(--space-3)' }}
    >
      <BlueprintFrame />
      <div
        style={{
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'color-mix(in srgb,var(--color-text) 50%,transparent)',
        }}
      >
        情報源を開く
      </div>
      {links.map((link) => (
        <a
          key={link.href}
          href={safeHref(link.href)}
          target="_blank"
          rel="noreferrer noopener"
          style={{ display: 'flex', flexDirection: 'column', gap: 2, textDecoration: 'none' }}
        >
          <span style={{ fontSize: 13, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-700)' }}>
            {link.label} ↗
          </span>
          <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{link.note}</span>
        </a>
      ))}
    </div>
  );
}
