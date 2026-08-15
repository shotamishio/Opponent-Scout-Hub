import type { CountryCode } from '@/data/pool';
import type { RosterGroup } from '@/types';

// Mirrors the mk() closure output, Scout Hub.dc.html lines 1034-1040.
export interface CountryCardData {
  code: CountryCode;
  ja: string;
  en: string;
  rank: number;
  conf: string;
  comp: RosterGroup;
  updates: number;
  hasNew: boolean;
  manage: boolean;
  flag: string;
  flagSm: string;
}
