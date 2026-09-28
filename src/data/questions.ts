export type Difficulty = 'moderate' | 'high';

export interface QuizDemo {
  speed: number;
  angleDeg: number;
  gravity: number;
}

export interface QuizQuestion {
  id: string;
  difficulty: Difficulty;
  topic: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  timeLimit: number;
  demo: QuizDemo;
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    difficulty: 'moderate',
    topic: 'Range',
    question:
      'A projectile is launched from level ground at 30° to the horizontal with speed u. At what other angle, with the same speed, would it have the same horizontal range?',
    choices: ['45°', '60°', '75°', '15°'],
    correctIndex: 1,
    explanation:
      'For a given launch speed, two complementary angles θ and (90° − θ) give equal ranges. The complement of 30° is 60°.',
    timeLimit: 45,
    demo: { speed: 24, angleDeg: 60, gravity: 9.81 },
  },
  {
    id: 'q2',
    difficulty: 'moderate',
    topic: 'Velocity at apex',
    question: 'At the highest point of its trajectory, the velocity of a projectile is:',
    choices: [
      'Zero',
      'Equal in magnitude to the launch speed u',
      'Purely horizontal, equal to u cos θ',
      'Purely vertical, equal to u sin θ',
    ],
    correctIndex: 2,
    explanation:
      'At the apex the vertical component is zero, but the horizontal component u cos θ is unchanged throughout the flight when air resistance is ignored.',
    timeLimit: 40,
    demo: { speed: 28, angleDeg: 45, gravity: 9.81 },
  },
  {
    id: 'q3',
    difficulty: 'moderate',
    topic: 'Time of flight',
    question:
      'A projectile is thrown with speed u at angle θ with the horizontal. Its time of flight before returning to the same level is:',
    choices: ['u sin θ / g', 'u cos θ / g', '2u sin θ / g', 'u² sin 2θ / g'],
    correctIndex: 2,
    explanation:
      'T = 2u sin θ / g. The factor of 2 follows from symmetry: time of ascent equals time of descent.',
    timeLimit: 45,
    demo: { speed: 22, angleDeg: 50, gravity: 9.81 },
  },
  {
    id: 'q4',
    difficulty: 'moderate',
    topic: 'Maximum range',
    question:
      'For a projectile launched from level ground, the horizontal range is maximum when the angle of projection is:',
    choices: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    explanation:
      'R = u² sin 2θ / g is maximum when sin 2θ = 1, i.e. 2θ = 90°, giving θ = 45°.',
    timeLimit: 30,
    demo: { speed: 26, angleDeg: 45, gravity: 9.81 },
  },
  {
    id: 'q5',
    difficulty: 'high',
    topic: 'Range = Height',
    question:
      'A projectile is thrown at an angle θ to the horizontal. If its horizontal range equals its maximum height, then tan θ equals:',
    choices: ['1', '2', '4', '1/2'],
    correctIndex: 2,
    explanation:
      'Setting R = H: u² sin 2θ / g = u² sin²θ / (2g). This gives 2 sin θ cos θ = sin²θ / 2, so tan θ = 4.',
    timeLimit: 90,
    demo: { speed: 20, angleDeg: 76, gravity: 9.81 },
  },
  {
    id: 'q6',
    difficulty: 'high',
    topic: 'Vector launch',
    question:
      'A body is projected with velocity (3î + 4ĵ) m/s from the ground. Taking g = 10 m/s², its horizontal range is:',
    choices: ['1.2 m', '2.4 m', '3.6 m', '4.8 m'],
    correctIndex: 1,
    explanation:
      'uₓ = 3 m/s, u_y = 4 m/s. T = 2u_y / g = 0.8 s. So R = uₓ · T = 3 × 0.8 = 2.4 m.',
    timeLimit: 75,
    demo: { speed: 5, angleDeg: 53, gravity: 10 },
  },
  {
    id: 'q7',
    difficulty: 'moderate',
    topic: 'Trajectory equation',
    question: 'The trajectory of a projectile is given by y = ax − bx². Its horizontal range is:',
    choices: ['a / b', 'b / a', 'a b', 'a² / b'],
    correctIndex: 0,
    explanation:
      'Setting y = 0 gives x(a − bx) = 0, so x = 0 (launch point) or x = a / b (landing point). The non-zero root is the range.',
    timeLimit: 60,
    demo: { speed: 18, angleDeg: 55, gravity: 9.81 },
  },
  {
    id: 'q8',
    difficulty: 'high',
    topic: 'Complementary angles',
    question:
      'Two projectiles are thrown with the same speed u at angles θ₁ and θ₂ where θ₁ + θ₂ = 90°. The ratio of their maximum heights H₁ / H₂ is:',
    choices: ['tan θ₁', 'cot θ₁', 'tan² θ₁', '1'],
    correctIndex: 2,
    explanation:
      'H₁ / H₂ = sin²θ₁ / sin²θ₂. Since θ₂ = 90° − θ₁, sin θ₂ = cos θ₁, giving tan²θ₁.',
    timeLimit: 90,
    demo: { speed: 24, angleDeg: 40, gravity: 9.81 },
  },
  {
    id: 'q9',
    difficulty: 'moderate',
    topic: 'Speed at apex',
    question:
      'A projectile is thrown at angle θ with speed u. At the top of its path its speed is u / √2. Then θ equals:',
    choices: ['30°', '60°', '45°', '75°'],
    correctIndex: 2,
    explanation:
      'Speed at the top equals u cos θ. Setting u cos θ = u / √2 gives θ = 45°.',
    timeLimit: 60,
    demo: { speed: 25, angleDeg: 45, gravity: 9.81 },
  },
  {
    id: 'q10',
    difficulty: 'high',
    topic: 'Speed at time t',
    question: 'A projectile is thrown at angle θ with speed u. Its speed at time t is:',
    choices: [
      'u − gt',
      'u cos θ − gt',
      '√(u² − 2ug t cos θ + g² t²)',
      '√(u² − 2ug t sin θ + g² t²)',
    ],
    correctIndex: 3,
    explanation:
      'vₓ = u cos θ and v_y = u sin θ − gt. So v = √(vₓ² + v_y²) = √(u² − 2ug t sin θ + g² t²).',
    timeLimit: 90,
    demo: { speed: 30, angleDeg: 55, gravity: 9.81 },
  },
];