export const FEATURE_COSTS = {
  recurring_training: 5,
  qrcode_checkin: 2,
  convocation: 3,
  analytics: 10,
  split_pix: 15,
  tactical_board: 1,
} as const;

export type FeatureType = keyof typeof FEATURE_COSTS;

export const GROUP_CREATION_COSTS = {
  atletica: 1000,
  modality_group: 0,
  standalone: 200,
} as const;
