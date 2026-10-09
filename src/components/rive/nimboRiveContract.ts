import type { NimboState } from '../../services/nimboStateController';
import manifest from '../../../assets/nimbo/rive/manifest.json';

// Stable values for the NimboModel data-binding contract. Never infer state
// numbers from object order; the editor project must use these exact values.
export const NIMBO_RIVE_STATES: Record<NimboState, number> = {
  NEUTRAL: 0, HAPPY: 1, ENERGETIC: 2, CALM: 3, SLEEPY: 4,
  TIRED: 5, STRESSED: 6, ENCOURAGING: 7, SLEEPING: 8, WAKING: 9,
  EATING: 10, PLAYING: 11, CELEBRATING: 12, BREAK_TIME: 13, IMPROVING: 14,
};
export const NIMBO_RIVE_CONTRACT = {
  artboard: 'Nimbo', stateMachine: 'NimboBehavior', viewModel: 'NimboModel',
} as const;

// Set only after visual validation, using a literal Metro require, e.g.
// require('../../../assets/nimbo/rive/nimbo.riv'). No placeholder character.
export const NIMBO_RIVE_ASSET: number | null = null;
export const NIMBO_RIVE_APPROVED = manifest.approved && manifest.enabled;

export function canUseRiveForState(state: NimboState, asset: number | null, approved: boolean) {
  return approved && asset !== null && manifest.supportedStates.includes(state);
}

export function canTapRive(state: NimboState, active: boolean, reduced: boolean) {
  return active && !reduced && !['SLEEPING', 'SLEEPY', 'EATING'].includes(state);
}

export interface NimboRiveViewProps {
  asset: number;
  state: NimboState;
  active: boolean;
  reduced: boolean;
  onFailure: () => void;
}
