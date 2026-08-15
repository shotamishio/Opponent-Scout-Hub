// Updated for the real-data version: match-results/schedule blocks removed
// (no free source), replaced with the real news collection.
export interface ReportBlock {
  label: string;
  pages: string;
  checked: boolean;
}

export const REPORT_BLOCKS: ReportBlock[] = [
  { label: 'サマリー', pages: '0.5p', checked: true },
  { label: '収集ニュース（T1–T2）', pages: '1p', checked: true },
  { label: '監督プロファイル（サンプルデータ）', pages: '1p', checked: true },
  { label: 'T3–T4の未確認情報', pages: '0.5p', checked: false },
];
