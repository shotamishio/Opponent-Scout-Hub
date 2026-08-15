// FEED_RAW (sample feed items) removed for the real-data version — the feed
// screen now aggregates real collected items instead (see FeedScreen.tsx +
// lib/collectedData.ts). ALERT_RULES describes app-level alert
// configuration/labels, not collected content, so it's kept as-is.
export interface AlertRule {
  label: string;
  state: string;
  tagClass: string;
}

export const ALERT_RULES: AlertRule[] = [
  { label: '招集メンバーの発表', state: 'T1のみ', tagClass: 'tag-accent' },
  { label: '負傷・離脱情報', state: 'T1–T2', tagClass: 'tag-accent-2' },
  { label: '試合日程の変更', state: 'T1–T2', tagClass: 'tag-accent-2' },
  { label: '戦術に関する報道', state: 'T2まで', tagClass: 'tag-neutral' },
  { label: '未確認の噂', state: '通知しない', tagClass: 'tag-outline' },
];
