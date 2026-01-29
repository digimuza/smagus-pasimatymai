export type SpicyCardType =
  | 'kiss'
  | 'challenge'
  | 'compliment'
  | 'massage'
  | 'slap'
  | 'whisper'
  | 'dare'
  | 'truth'
  | 'hug'
  | 'dance';

export type SpicyCardRarity = 'rare' | 'semi-rare' | 'medium' | 'frequent' | 'ultra';

export interface SpicyCard {
  id: string;
  type: SpicyCardType;
  title: string;
  description: string;
  icon: string; // emoji
  color: string; // hex color for card background
}

export interface SpicyCardSettings {
  enabled: boolean;
  rarity: SpicyCardRarity; // How often they appear (probability-based)
  enabledTypes: SpicyCardType[];
}

export const RARITY_PROBABILITIES: Record<SpicyCardRarity, number> = {
  rare: 0.05, // 5% chance
  'semi-rare': 0.15, // 15% chance
  medium: 0.30, // 30% chance
  frequent: 0.40, // 40% chance
  ultra: 0.50, // 50% chance
};
