import { SpicyCard } from '@/types/spicyCards';

export const SPICY_CARDS: SpicyCard[] = [
  // Kiss cards
  {
    id: 'kiss-1',
    type: 'kiss',
    title: '💋 Bučinys',
    description: 'Pabučiuok partnerį/-ę į lūpas',
    icon: '💋',
    color: '#FF6B9D',
  },
  {
    id: 'kiss-2',
    type: 'kiss',
    title: '💋 Švelnumas',
    description: 'Švelniai pabučiuok partnerio/-ės kaktą',
    icon: '💋',
    color: '#FF6B9D',
  },
  {
    id: 'kiss-3',
    type: 'kiss',
    title: '💋 Netikėtumas',
    description: 'Pabučiuok partnerį/-ę į pasirinktą vietą',
    icon: '💋',
    color: '#FF6B9D',
  },

  // Challenge cards
  {
    id: 'challenge-1',
    type: 'challenge',
    title: '🎯 Iššūkis',
    description: 'Papasakok 3 dalykus, kuriuos mėgsti partneryje per 30 sekundžių',
    icon: '🎯',
    color: '#FFA500',
  },
  {
    id: 'challenge-2',
    type: 'challenge',
    title: '🎯 Žaidimas',
    description: 'Pažvelk į partnerio akis 60 sekundžių be juoko',
    icon: '🎯',
    color: '#FFA500',
  },
  {
    id: 'challenge-3',
    type: 'challenge',
    title: '🎯 Drąsa',
    description: 'Padaryk kažką, ko niekada nedrįsai prašyti',
    icon: '🎯',
    color: '#FFA500',
  },

  // Compliment cards
  {
    id: 'compliment-1',
    type: 'compliment',
    title: '💝 Komplimentas',
    description: 'Pasakyk, kas tau labiausiai patinka partneryje fiziškai',
    icon: '💝',
    color: '#C77DFF',
  },
  {
    id: 'compliment-2',
    type: 'compliment',
    title: '💝 Gražūs žodžiai',
    description: 'Pasakyk, kokia partnero savybė tave labiausiai traukia',
    icon: '💝',
    color: '#C77DFF',
  },
  {
    id: 'compliment-3',
    type: 'compliment',
    title: '💝 Vertinimas',
    description: 'Pasakyk, už ką esi labiausiai dėkingas/-a partneriui',
    icon: '💝',
    color: '#C77DFF',
  },

  // Massage cards
  {
    id: 'massage-1',
    type: 'massage',
    title: '💆 Masažas',
    description: 'Padaryk 2 minučių pečių masažą partneriui',
    icon: '💆',
    color: '#7B68EE',
  },
  {
    id: 'massage-2',
    type: 'massage',
    title: '💆 Atsipalaidavimas',
    description: 'Švelniai pamasažuok partnero galvą',
    icon: '💆',
    color: '#7B68EE',
  },
  {
    id: 'massage-3',
    type: 'massage',
    title: '💆 Rūpestis',
    description: 'Pamasažuok partneriui kojas 3 minutes',
    icon: '💆',
    color: '#7B68EE',
  },

  // Slap cards (playful)
  {
    id: 'slap-1',
    type: 'slap',
    title: '👋 Žaismingas',
    description: 'Lengvai plokštelėk partnerį/-ę už kvailiojimą',
    icon: '👋',
    color: '#FF6347',
  },
  {
    id: 'slap-2',
    type: 'slap',
    title: '👋 Bausmė',
    description: 'Žaismingai nubauski partnerį už paskutinį pralaimėjimą',
    icon: '👋',
    color: '#FF6347',
  },

  // Whisper cards
  {
    id: 'whisper-1',
    type: 'whisper',
    title: '🤫 Šnibždesys',
    description: 'Sušnibžděk į ausį, ką jautiesi dabar',
    icon: '🤫',
    color: '#FF1493',
  },
  {
    id: 'whisper-2',
    type: 'whisper',
    title: '🤫 Paslaptis',
    description: 'Sušnibžděk savo slapčiausią norą',
    icon: '🤫',
    color: '#FF1493',
  },
  {
    id: 'whisper-3',
    type: 'whisper',
    title: '🤫 Švelni paslaptis',
    description: 'Sušnibžděk, kas tau labiausiai patinka partneryje',
    icon: '🤫',
    color: '#FF1493',
  },

  // Dare cards
  {
    id: 'dare-1',
    type: 'dare',
    title: '🔥 Išdrįsk',
    description: 'Išdrįsk pasakyti ką nors, ko niekada nesakei',
    icon: '🔥',
    color: '#FF4500',
  },
  {
    id: 'dare-2',
    type: 'dare',
    title: '🔥 Drąsa',
    description: 'Padaryk kažką spontaniško',
    icon: '🔥',
    color: '#FF4500',
  },
  {
    id: 'dare-3',
    type: 'dare',
    title: '🔥 Rizika',
    description: 'Papasakok apie savo fantaziją',
    icon: '🔥',
    color: '#FF4500',
  },

  // Truth cards
  {
    id: 'truth-1',
    type: 'truth',
    title: '💭 Tiesa',
    description: 'Atsakyk į bet kokį partnero klausimą sąžiningai',
    icon: '💭',
    color: '#4169E1',
  },
  {
    id: 'truth-2',
    type: 'truth',
    title: '💭 Atvirumas',
    description: 'Papasakok kažką, ko partneris dar nežino',
    icon: '💭',
    color: '#4169E1',
  },

  // Hug cards
  {
    id: 'hug-1',
    type: 'hug',
    title: '🤗 Apkabinimas',
    description: 'Apkabink partnerį/-ę 30 sekundžių tyloje',
    icon: '🤗',
    color: '#FFB6C1',
  },
  {
    id: 'hug-2',
    type: 'hug',
    title: '🤗 Šiluma',
    description: 'Stipriai apkabink ir pasakyk "Myliu"',
    icon: '🤗',
    color: '#FFB6C1',
  },

  // Dance cards
  {
    id: 'dance-1',
    type: 'dance',
    title: '💃 Šokis',
    description: 'Pašokite lėtą šokį be muzikos',
    icon: '💃',
    color: '#DA70D6',
  },
  {
    id: 'dance-2',
    type: 'dance',
    title: '💃 Judesys',
    description: 'Šokite kartu vieną minutę',
    icon: '💃',
    color: '#DA70D6',
  },
];

export const DEFAULT_SPICY_SETTINGS = {
  enabled: true,
  rarity: 'medium' as const, // 30% chance
  enabledTypes: [
    'kiss',
    'challenge',
    'compliment',
    'massage',
    'whisper',
    'dare',
    'truth',
    'hug',
    'dance',
  ] as const,
};

export const RARITY_LABELS = {
  rare: '🔹 Retas (5%)',
  'semi-rare': '🔸 Pusiau retas (15%)',
  medium: '⚪ Vidutinis (30%)',
  frequent: '🟡 Dažnas (40%)',
  ultra: '🔥 Ultra dažnas (50%)',
};

export const SPICY_CARD_TYPE_LABELS = {
  kiss: '💋 Bučinys',
  challenge: '🎯 Iššūkis',
  compliment: '💝 Komplimentas',
  massage: '💆 Masažas',
  slap: '👋 Žaismingas',
  whisper: '🤫 Šnibždesys',
  dare: '🔥 Išdrįsk',
  truth: '💭 Tiesa',
  hug: '🤗 Apkabinimas',
  dance: '💃 Šokis',
};
