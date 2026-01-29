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
  frequency: number; // 1-10, how often they appear (every N questions)
  enabledTypes: SpicyCardType[];
}
