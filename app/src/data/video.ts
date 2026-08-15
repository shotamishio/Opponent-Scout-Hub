// Ported from Scout Hub.dc.html lines 1087-1107. The final videoPeople entry
// in the source is dynamic ([this.coach(S.code).name, '監督']) — VIDEO_PEOPLE_BASE
// holds only the 4 static people; the screen appends the current coach.
export const VIDEO_STEP_LABELS = ['音声の取得', '文字起こし（原語）', '日本語への翻訳', '要約と戦術タグ抽出'];

export interface VideoPoint {
  text: string;
  at: string;
}

export const VIDEO_POINTS: VideoPoint[] = [
  { text: '招集メンバー発表の意図を説明。初招集3名は「予選での可変システムに対応できる選手」と明言。', at: '01:12' },
  { text: '負傷離脱2名について、復帰は10月シリーズを目標とすると回答。', at: '04:38' },
  { text: '中盤の構成を1アンカーへ戻す可能性を認めたが、相手次第と留保。', at: '09:05' },
  { text: 'セットプレーの守備で「ゾーンとマンマークの併用を続ける」と説明。', at: '14:20' },
  { text: '日本との対戦について「切り替えの速さが最大の脅威」と評価。', at: '19:47' },
];

export interface VideoTag {
  label: string;
  count: number;
}

export const VIDEO_TAGS: VideoTag[] = [
  { label: '守備ブロック', count: 4 },
  { label: 'セットプレー', count: 3 },
  { label: 'ハイプレス', count: 3 },
  { label: '可変システム', count: 2 },
  { label: 'ビルドアップ', count: 2 },
  { label: 'カウンター', count: 1 },
];

export interface VideoPerson {
  name: string;
  role: string;
}

export const VIDEO_PEOPLE_BASE: VideoPerson[] = [
  { name: 'A. モリーナ', role: 'FW / 初招集' },
  { name: 'L. ガルシア', role: 'MF / 主将' },
  { name: 'N. ロペス', role: 'DF / 負傷離脱' },
  { name: 'P. サンチェス', role: 'GK' },
];

export interface VideoTranscriptLine {
  at: string;
  who: string;
  text: string;
}

export const VIDEO_TRANSCRIPT: VideoTranscriptLine[] = [
  { at: '00:42', who: '記者', text: '今回の招集で最も重視した点を教えてください。' },
  { at: '01:12', who: '監督', text: '予選で使う可変的なシステムに対応できるかどうかです。初招集の3名はいずれも複数ポジションを担えます。' },
  { at: '04:38', who: '記者', text: '負傷離脱の2名の状況は。' },
  { at: '04:51', who: '監督', text: '段階的に負荷を上げている段階です。復帰は10月のシリーズを目標にしています。' },
  { at: '09:05', who: '記者', text: '中盤の並びを変える考えはありますか。' },
  { at: '09:18', who: '監督', text: '相手次第です。アンカーを1枚に戻す準備はしていますが、確定ではありません。' },
  { at: '14:20', who: '監督', text: 'セットプレーの守備はゾーンとマンマークの併用を続けます。担当を明確にすることが最優先です。' },
  { at: '19:47', who: '監督', text: '日本と対戦するなら、最大の脅威は切り替えの速さでしょう。奪われた直後の5秒をどう設計するかが鍵になります。' },
];

export const VIDEO_META = '記者会見 22:14 / 原語 Spanish / 処理 47秒';
