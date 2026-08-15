// Ported from Scout Hub.dc.html lines 963-989.
import { POOL, type CountryCode } from '@/data/pool';
import type { TierKey } from '@/types';
import { COACHES } from '@/data/coaches';
import { TIERS, type TierInfo } from '@/data/tiers';
import { hash } from './hash';

export interface CoachTrait {
  label: string;
  value: string;
  pct: string;
}

export interface CoachCareerStep {
  years: string;
  role: string;
  detail: string;
}

export interface CoachHonour {
  comp: string;
  year: string;
  result: string;
}

export interface CoachReputation extends TierInfo {
  tier: TierKey;
  src: string;
  text: string;
}

export interface Coach {
  name: string;
  initials: string;
  nat: string;
  since: string;
  record: string;
  winRate: string;
  brief: string;
  traits: CoachTrait[];
  career: CoachCareerStep[];
  honours: CoachHonour[];
  reputation: CoachReputation[];
}

export function coach(code: CountryCode): Coach {
  const h = hash(code);
  const c = POOL[code];
  const name = COACHES[h % COACHES.length];
  return {
    name,
    initials: name.slice(0, 1) + '.',
    nat: c.en,
    since: '2023年2月',
    record: '34勝9分11敗',
    winRate: '63%',
    brief:
      'ボール保持と即時奪回を軸に据える現代的な指導者です。就任以降、ビルドアップの原則を大きく変えず、相手に応じて最終ラインの枚数だけを可変させる運用を続けています。プレスは高い位置から掛けますが、リード時は無理に前へ出ず中盤でブロックを作る現実的な判断も見せます。',
    traits: [
      { label: 'ボール保持', value: '高', pct: '82%' },
      { label: 'ハイプレス', value: '高', pct: '76%' },
      { label: 'サイド攻撃', value: '中', pct: '58%' },
      { label: 'セットプレー重視', value: '中', pct: '49%' },
    ],
    career: [
      { years: '2023–現在', role: c.en + ' 女子代表 監督', detail: '就任1年目に大陸予選を突破。世代交代を進めながら結果を落とさず、若手6名を主力に定着させました。' },
      { years: '2020–2022', role: '国内1部クラブ 監督', detail: 'リーグ2連覇と国内カップ優勝。保持志向のスタイルをこの時期に確立しています。' },
      { years: '2017–2020', role: '同国 U-20女子代表 監督', detail: '年代別ワールドカップでベスト8。現在の代表主力の多くをこの時期に指導しました。' },
      { years: '2013–2017', role: 'クラブ アカデミー統括', detail: '育成部門で戦術原則の共通言語化を主導。指導者としての土台を築いた時期です。' },
    ],
    honours: [
      { comp: '大陸選手権', year: '2025', result: '優勝' },
      { comp: 'W杯予選', year: '2025', result: '首位通過' },
      { comp: '招待国際大会', year: '2024', result: '準優勝' },
      { comp: '国内リーグ（クラブ）', year: '2021・2022', result: '優勝' },
    ],
    reputation: [
      { tier: 'T1', src: '協会 技術委員長コメント（公式会見）', text: '「長期的な強化計画に沿って着実に積み上げている。次のサイクルまで継続して任せる方針だ」と明言しています。', ...TIERS.T1 },
      { tier: 'T2', src: '現地主要紙 戦術コラム', text: '選手起用の一貫性を評価する一方、ビハインド時の交代が遅いという指摘が繰り返し出ています。', ...TIERS.T2 },
      { tier: 'T3', src: '現地記者 個人SNS', text: 'ロッカールームの信頼は厚いが、一部のベテランに序列固定への不満があるとの記述。単独ソースです。', ...TIERS.T3 },
      { tier: 'T4', src: 'サポーターフォーラム', text: '守備的な試合運びへの批判が一定数見られます。内容の裏取りはできていません。', ...TIERS.T4 },
    ],
  };
}
