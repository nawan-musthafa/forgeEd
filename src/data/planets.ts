export type PlanetId = 'moon' | 'mars' | 'earth' | 'jupiter';

export interface PlanetTheme {
  id: PlanetId;
  label: string;
  gravity: number;
  image: string;
  fallback: string;
  accent: string;
  accentSoft: string;
  /** Colour used for live velocity readouts on this planet. */
  valueColor: string;
}

export const PLANET_THEMES: PlanetTheme[] = [
  {
    id: 'moon',
    label: 'Moon',
    gravity: 1.62,
    image: '/backgrounds/moon.jpg',
    fallback:
      'radial-gradient(ellipse 120% 80% at 50% 20%, #1e2433 0%, #0b0f1a 45%, #04060b 100%)',
    accent: '#cbd5e1',
    accentSoft: 'rgba(203, 213, 225, 0.12)',
    valueColor: '#ffffff',
  },
  {
    id: 'mars',
    label: 'Mars',
    gravity: 3.71,
    image: '/backgrounds/mars.jpg',
    fallback:
      'radial-gradient(ellipse 120% 80% at 50% 20%, #3b1410 0%, #1a0806 50%, #060202 100%)',
    accent: '#fb923c',
    accentSoft: 'rgba(251, 146, 60, 0.14)',
    valueColor: '#22c55e',
  },
  {
    id: 'earth',
    label: 'Earth',
    gravity: 9.81,
    image: '/backgrounds/earth.jpg',
    fallback:
      'radial-gradient(ellipse 120% 80% at 50% 20%, #0a1e3d 0%, #05101f 50%, #01040a 100%)',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.14)',
    valueColor: '#0284c7',
  },
  {
    id: 'jupiter',
    label: 'Jupiter',
    gravity: 24.79,
    image: '/backgrounds/jupiter.jpg',
    fallback:
      'radial-gradient(ellipse 120% 80% at 50% 20%, #3a2010 0%, #1a0e05 50%, #060301 100%)',
    accent: '#fbbf24',
    accentSoft: 'rgba(251, 191, 36, 0.14)',
    valueColor: '#fde047',
  },
];

export function closestPlanet(gravity: number): PlanetTheme {
  let best = PLANET_THEMES[0];
  let bestDelta = Math.abs(best.gravity - gravity);
  for (const planet of PLANET_THEMES) {
    const delta = Math.abs(planet.gravity - gravity);
    if (delta < bestDelta) {
      best = planet;
      bestDelta = delta;
    }
  }
  return best;
}