// Ported from Scout Hub.dc.html lines 883-888. bg/fg/bd/accent/headBg stay as
// CSS var() references so the navy accent-override.css flows through them
// automatically at paint time — do not resolve them to literal colors here.
import type { TierKey } from '@/types';

export interface TierInfo {
  label: string;
  desc: string;
  score: string;
  bg: string;
  fg: string;
  bd: string;
  accent: string;
  headBg: string;
}

export const TIERS: Record<TierKey, TierInfo> = {
  T1: {
    label: '協会・クラブ公式',
    desc: '各国協会、クラブ、大会公式のリリースと公式SNS。一次情報として扱います。',
    score: '98%',
    bg: 'var(--color-accent)',
    fg: 'var(--color-bg)',
    bd: 'var(--color-accent)',
    accent: 'var(--color-accent)',
    headBg: 'var(--color-accent-100)',
  },
  T2: {
    label: '現地主要メディア',
    desc: '現地の全国紙・公共放送・専門紙。事実関係はおおむね信頼できます。',
    score: '82%',
    bg: 'var(--color-accent-200)',
    fg: 'var(--color-accent-800)',
    bd: 'var(--color-accent-300)',
    accent: 'var(--color-accent-400)',
    headBg: 'transparent',
  },
  T3: {
    label: '記者個人',
    desc: '現地記者個人のSNS投稿。速報性は高いが単独ソースは要確認。',
    score: '54%',
    bg: 'var(--color-neutral-200)',
    fg: 'var(--color-neutral-800)',
    bd: 'var(--color-neutral-300)',
    accent: 'var(--color-neutral-400)',
    headBg: 'transparent',
  },
  T4: {
    label: 'ファン情報',
    desc: 'サポーターの投稿・掲示板・現地目撃情報。傾向把握の参考のみ。',
    score: '23%',
    bg: 'transparent',
    fg: 'var(--color-neutral-700)',
    bd: 'color-mix(in srgb, var(--color-text) 30%, transparent)',
    accent: 'var(--color-neutral-300)',
    headBg: 'transparent',
  },
};

export const TIER_KEYS: TierKey[] = ['T1', 'T2', 'T3', 'T4'];
