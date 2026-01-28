// Categories that are safe and selected by default
export const SAFE_CATEGORIES = [
  'Apie vaikystę ir praeitį',
  'Apie svajones ir ateitį',
  'Apie baimes ir pažeidžiamumą',
  'Apie meilę ir santykius',
  'Apie vertybes ir tikėjimą',
  'Apie asmenybę ir savęs pažinimą',
  'Apie mus',
  'Egzistenciniai klausimai',
  'Hipotetiniai ir „kas būtų, jei" klausimai',
  'Apie ryšį ir žmones',
  'Apie prasmę ir gyvenimo klausimus',
  'Apie jausmus ir vidinį pasaulį',
];

// Categories that are NOT selected by default (intimate questions)
export const INTIMATE_CATEGORIES = [
  'Intymūs klausimai',
  'Gilūs intymūs klausimai',
  'Atviri klausimai apie seksą',
];

// LocalStorage key
export const STORAGE_KEY = 'santykiu_klausimai_state';

// Swipe thresholds (in pixels)
// Labels start appearing at 50px, so threshold is set slightly higher
export const SWIPE_THRESHOLD = 60;
export const SWIPE_VELOCITY_THRESHOLD = 500;
