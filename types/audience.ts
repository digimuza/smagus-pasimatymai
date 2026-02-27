export type AudienceSlug = 'romantic' | 'family' | 'kids' | 'friends';

export interface AudienceMetadata {
  slug: AudienceSlug;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export const AUDIENCE_DEFAULTS: AudienceMetadata[] = [
  {
    slug: 'romantic',
    name: 'Poroms',
    description: 'Klausimai, kurie padės geriau pažinti savo antrąją pusę',
    icon: '💜',
    color: '#9B59B6',
    sortOrder: 1,
  },
  {
    slug: 'family',
    name: 'Šeimai',
    description: 'Šilti klausimai visai šeimai — nuo senelių iki vaikų',
    icon: '🏠',
    color: '#3498DB',
    sortOrder: 2,
  },
  {
    slug: 'friends',
    name: 'Draugams',
    description: 'Klausimai draugų vakarams ir kompanijoms',
    icon: '🎉',
    color: '#E67E22',
    sortOrder: 3,
  },
  {
    slug: 'kids',
    name: 'Vaikams',
    description: 'Linksmi ir saugūs klausimai mažiesiems',
    icon: '🌈',
    color: '#2ECC71',
    sortOrder: 4,
  },
];
