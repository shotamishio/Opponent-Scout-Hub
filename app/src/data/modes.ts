// Ported from Scout Hub.dc.html lines 869-875.
import type { ModeKey } from '@/types';

export interface Mode {
  key: ModeKey;
  ja: string;
  en: string;
  short: string;
  note: string;
}

export const MODES: Mode[] = [
  {
    key: 'nadeshiko',
    ja: 'なでしこジャパン',
    en: 'Senior',
    short: 'A代表',
    note: 'FIFA女子ワールドカップ・オリンピック・AFC女子アジアカップで当たる可能性のある国を常設で監視しています。カードをクリックすると国別詳細に入ります。',
  },
  {
    key: 'u20',
    ja: 'U-20 日本女子代表',
    en: 'U-20',
    short: 'U-20',
    note: 'U-20女子ワールドカップ出場国と、AFC U-20女子アジアカップ予選で対戦する国を対象にしています。年代別は選手の入れ替わりが速いため、招集リストの更新を優先して収集します。',
  },
  {
    key: 'u19',
    ja: 'U-19 日本女子代表',
    en: 'U-19',
    short: 'U-19',
    note: 'AFC U-19女子選手権（2002–2019）の系譜にあたるカテゴリーです。現行のU-20と選手層が重なるため、アジアでの対戦履歴を参照する用途を主に想定しています。',
  },
  {
    key: 'u17',
    ja: 'U-17 日本女子代表',
    en: 'U-17',
    short: 'U-17',
    note: 'U-17女子ワールドカップ出場国とAFC U-17予選の対戦国です。公式情報が少ないため、現地メディアと記者個人の情報が相対的に重要になります。ティア表記を必ず確認してください。',
  },
  {
    key: 'u16',
    ja: 'U-16 日本女子代表',
    en: 'U-16',
    short: 'U-16',
    note: 'AFC U-16女子選手権の系譜にあたるカテゴリーです。公開情報が最も少ない年代のため、協会公式の大会ページとアジア各国の育成カテゴリー報道を中心に収集します。',
  },
];
