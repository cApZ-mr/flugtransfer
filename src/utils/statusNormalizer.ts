import { TradeNegotiationStatus } from '../types/roster';

/**
 * Normalizes any legacy or unexpected status values strictly to one of:
 * 'Offen' | 'In Verhandlung' | 'Abgegeben'
 */
export function normalizeTradeStatus(raw: unknown): TradeNegotiationStatus {
  if (typeof raw !== 'string' || !raw) return 'Offen';
  const clean = raw.trim();

  if (
    clean === 'Abgegeben' || 
    clean === 'COMPLETED' || 
    clean === 'GETAUSCHT' || 
    clean === 'SWAPPED' || 
    clean === 'BESTAETIGT'
  ) {
    return 'Abgegeben';
  }

  if (
    clean === 'In Verhandlung' || 
    clean === 'IN_VERHANDLUNG' || 
    clean === 'IN_PROGRESS' || 
    clean === 'NEGOTIATING' || 
    clean === 'ANFRAGE' || 
    clean === 'BESTAETIGUNG_AUSSTEHEND'
  ) {
    return 'In Verhandlung';
  }

  return 'Offen';
}

export interface StatusMetadata {
  status: TradeNegotiationStatus;
  label: string;
  color: string;
  progress: number;
  step: number;
}

/**
 * Returns complete presentation metadata for any trade status, always guaranteed to not be undefined.
 */
export function getTradeStatusMetadata(rawStatus: unknown): StatusMetadata {
  const status = normalizeTradeStatus(rawStatus);

  switch (status) {
    case 'In Verhandlung':
      return {
        status: 'In Verhandlung',
        label: 'In Verhandlung',
        color: 'text-amber-300 bg-amber-500/15 border-amber-500/35',
        progress: 66,
        step: 2,
      };
    case 'Abgegeben':
      return {
        status: 'Abgegeben',
        label: 'Abgegeben',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35',
        progress: 100,
        step: 3,
      };
    case 'Offen':
    default:
      return {
        status: 'Offen',
        label: 'Offen',
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
        progress: 33,
        step: 1,
      };
  }
}
