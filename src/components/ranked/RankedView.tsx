import React, { useEffect, useMemo, useState } from 'react';

type Exam = 'jee' | 'neet' | 'basics';
type Subject = 'physics' | 'chemistry' | 'maths';
type Phase = 'exam' | 'subject' | 'quiz' | 'review';

interface JeeQ {
  id: string;
  topic: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  timeLimit: number;
  diagram?: 'cliff-angled' | 'horizontal-launch' | 'complementary' | 'rain-man'
          | 'river-cross' | 'parabola' | 'hill-launch' | 'block-force'
          | 'pulley' | 'boat-minpath' | 'bohr' | 'periodic-trend'
          | 'triangle' | 'quadratic-curve';
}

/* ==================================================================== */
/* PHYSICS — already present                                            */
/* ==================================================================== */

const JEE_PHYSICS: JeeQ[] = [
  {
    id: 'p1', topic: 'Projectile from a height',
    prompt: 'A stone is thrown upwards at 30° with speed 30 m/s from the top of a cliff 80 m high. Where does the stone land, measured horizontally from the base of the cliff? (Take g = 10 m/s².)',
    choices: ['90 m', '120 m', '150 m', '180 m'],
    correctIndex: 2,
    explanation:
      'Step 1 — resolve. uₓ = 30 cos 30° = 15√3 ≈ 25.98 m/s. u_y = 30 sin 30° = 15 m/s.\n' +
      'Step 2 — vertical equation. y(t) = 80 + 15t − 5t². Setting y = 0: 5t² − 15t − 80 = 0 → t² − 3t − 16 = 0.\n' +
      'Step 3 — positive root. t = (3 + √(9 + 64)) / 2 = (3 + √73)/2 ≈ 5.77 s.\n' +
      'Step 4 — horizontal range. R = uₓ · t = 15√3 × 5.77 ≈ 150 m.\n' +
      'Common trap: many students use T = 2u sin θ / g. That formula is only valid when the launch and landing points are at the same height. Here the launch is 80 m above the landing, so you must solve the vertical quadratic.',
    timeLimit: 90,
    diagram: 'cliff-angled',
  },
  {
    id: 'p2', topic: 'Horizontal launch',
    prompt: 'A ball rolls off the edge of a table 20 m high with a horizontal speed of 10 m/s. With what angle below the horizontal does it strike the ground? (Take g = 10 m/s².)',
    choices: ['26.6°', '45.0°', '63.4°', '90.0°'],
    correctIndex: 2,
    explanation:
      'Step 1 — time of fall. T = √(2h/g) = √(40/10) = 2 s.\n' +
      'Step 2 — velocity components on impact. vₓ = uₓ = 10 m/s. v_y = gT = 10 × 2 = 20 m/s.\n' +
      'Step 3 — angle. tan θ = v_y / vₓ = 20/10 = 2 → θ = tan⁻¹(2) ≈ 63.4°.\n' +
      'Common trap: using T = √(h/g) instead of √(2h/g). The factor of 2 comes from h = ½ g T².',
    timeLimit: 75,
    diagram: 'horizontal-launch',
  },
  {
    id: 'p3', topic: 'Complementary angles',
    prompt: 'Two projectiles are thrown with the same speed at angles θ₁ and θ₂, and have equal horizontal ranges. If their maximum heights are 4 m and 12 m, then θ₁ and θ₂ are:',
    choices: ['15° and 75°', '30° and 60°', '45° and 45°', '20° and 70°'],
    correctIndex: 1,
    explanation:
      'Step 1 — complementary angles. Same range, same speed → θ₁ + θ₂ = 90°, so sin θ₂ = cos θ₁.\n' +
      'Step 2 — height ratio. H ∝ sin²θ, so H₁/H₂ = sin²θ₁ / cos²θ₁ = tan²θ₁.\n' +
      'Step 3 — plug in. 4/12 = tan²θ₁ → tan θ₁ = 1/√3 → θ₁ = 30°.\n' +
      'Step 4 — other angle. θ₂ = 90° − 30° = 60°.\n' +
      'Memorise: for complementary angles, tan θ₁ = √(H₁/H₂).',
    timeLimit: 75,
    diagram: 'complementary',
  },
  {
    id: 'p4', topic: 'Rain and man',
    prompt: 'Rain is falling vertically downward with speed 4 km/h. A man walks at 3 km/h on a horizontal road. At what angle from the vertical does the rain appear to fall to him?',
    choices: ['30°', '37°', '45°', '53°'],
    correctIndex: 1,
    explanation:
      'Step 1 — relative velocity. v_rel = v_rain − v_man = (0, −4) − (3, 0) = (−3, −4) km/h.\n' +
      'Step 2 — angle. tan θ = |horizontal| / |vertical| = 3/4 → θ = tan⁻¹(0.75) = 37°.\n' +
      'Step 3 — direction. Rain appears to come from the front. Umbrella tilts forward by 37°.\n' +
      'Common trap: confusing the magnitude 5 km/h with the angle 37°. Magnitude is irrelevant for the umbrella; only the angle matters.',
    timeLimit: 60,
    diagram: 'rain-man',
  },
  {
    id: 'p5', topic: 'River crossing · shortest path',
    prompt: 'A swimmer can swim at 5 km/h in still water. A river 0.5 km wide flows at 3 km/h. To reach the point on the opposite bank directly across, how long does the trip take?',
    choices: ['6 min', '7.5 min', '10 min', '12 min'],
    correctIndex: 1,
    explanation:
      'Step 1 — no-drift angle. He aims upstream so horizontal components cancel: v sin θ = 3 → sin θ = 0.6 → θ = 37° from perpendicular.\n' +
      'Step 2 — effective crossing speed. v_⊥ = 5 cos 37° = 4 km/h.\n' +
      'Step 3 — time. t = 0.5 / 4 = 0.125 h = 7.5 min.\n' +
      'Common trap: using v_⊥ = 5 km/h. Only the perpendicular component carries him across.',
    timeLimit: 75,
    diagram: 'river-cross',
  },
  {
    id: 'p6', topic: 'Maximum height & range',
    prompt: 'A projectile has a maximum height of 20 m and a horizontal range of 40 m. What is its speed and angle of projection? (g = 10 m/s².)',
    choices: ['20 m/s at 45°', '22.4 m/s at 63.4°', '25 m/s at 30°', '30 m/s at 60°'],
    correctIndex: 1,
    explanation:
      'Step 1 — angle from H and R. H/R = tan θ / 4. So 20/40 = tan θ / 4 → tan θ = 2 → θ = 63.4°.\n' +
      'Step 2 — speed from H. H = u² sin²θ / (2g) → 20 = u²(4/5)/20 → u² = 500 → u = 22.4 m/s.\n' +
      'Memorise: H/R = tan θ / 4.',
    timeLimit: 90,
    diagram: 'parabola',
  },
  {
    id: 'p7', topic: 'Projectile from a hill',
    prompt: 'A shell is fired from the top of a hill at 30° above horizontal with speed 30 m/s. It lands 120 m away horizontally on the flat ground. How tall is the hill? (g = 10 m/s².)',
    choices: ['20 m', '30 m', '37.4 m', '50 m'],
    correctIndex: 2,
    explanation:
      'Step 1 — flight time from horizontal. uₓ = 30 cos 30° = 15√3. 120 = 15√3 · t → t = 8/√3 ≈ 4.62 s.\n' +
      'Step 2 — vertical equation. 0 = h + 15t − 5t². So h = 5t² − 15t ≈ 5(21.33) − 15(4.62) ≈ 37.4 m.\n' +
      'Common trap: using the same-level formula T = 2u sinθ/g. Here launch and landing are at different heights.',
    timeLimit: 90,
    diagram: 'hill-launch',
  },
  {
    id: 'p8', topic: 'Block with angled force',
    prompt: 'A 5 kg block rests on a horizontal surface with μ = 0.4. A force of 40 N is applied at 37° above horizontal. Find the acceleration. (Take g = 10 m/s².)',
    choices: ['4.32 m/s²', '5.00 m/s²', '6.40 m/s²', '8.00 m/s²'],
    correctIndex: 0,
    explanation:
      'Step 1 — decompose. Fₓ = 40 cos 37° = 32 N. F_y = 40 sin 37° = 24 N (upward).\n' +
      'Step 2 — normal reaction. N = mg − F_y = 50 − 24 = 26 N.\n' +
      'Step 3 — friction. f = μN = 0.4 × 26 = 10.4 N.\n' +
      'Step 4 — net force. F_net = 32 − 10.4 = 21.6 N.\n' +
      'Step 5 — acceleration. a = 21.6/5 = 4.32 m/s².\n' +
      'Common trap: forgetting that F_y reduces N.',
    timeLimit: 90,
    diagram: 'block-force',
  },
  {
    id: 'p9', topic: 'Pulley system',
    prompt: 'Masses 3 kg and 5 kg are connected by a light inextensible string over a frictionless pulley. Find acceleration and tension. (g = 10 m/s².)',
    choices: ['2.5 m/s² and 37.5 N', '2.0 m/s² and 35.0 N', '1.25 m/s² and 30.0 N', '5.0 m/s² and 40.0 N'],
    correctIndex: 0,
    explanation:
      'Step 1 — acceleration. a = (m₂ − m₁)g / (m₁ + m₂) = (5 − 3)(10) / 8 = 2.5 m/s².\n' +
      'Step 2 — tension. For the 3 kg block (moving up): T − m₁g = m₁a → T = 30 + 7.5 = 37.5 N.\n' +
      'Shortcut: T = 2m₁m₂g / (m₁ + m₂) = 300/8 = 37.5 N.',
    timeLimit: 75,
    diagram: 'pulley',
  },
  {
    id: 'p10', topic: 'Boat · minimum path',
    prompt: 'A boat rows at 4 km/h. River flows at 2 km/h. At what angle to the flow direction should the boat be aimed to cross along the shortest path?',
    choices: ['30°', '60°', '120°', '90°'],
    correctIndex: 2,
    explanation:
      'Step 1 — no-drift condition. v_boat · sin α = v_river → 4 sin α = 2 → sin α = 0.5 → α = 30° (from perpendicular).\n' +
      'Step 2 — from the flow direction. Angle from flow = 90° + 30° = 120°.\n' +
      'Note: if the flow were stronger than the boat speed, no-drift would be impossible.',
    timeLimit: 60,
    diagram: 'boat-minpath',
  },
];

/* ==================================================================== */
/* CHEMISTRY — mole concept, structure of atom, periodic properties      */
/* ==================================================================== */

const JEE_CHEMISTRY: JeeQ[] = [
  {
    id: 'c1', topic: 'Mole concept · atoms per mole',
    prompt: 'How many atoms are present in 0.5 mol of H₂SO₄?',
    choices: ['6.022 × 10²³', '2.107 × 10²⁴', '4.215 × 10²⁴', '3.011 × 10²³'],
    correctIndex: 1,
    explanation:
      'Step 1 — atoms per molecule. H₂SO₄ has 2 H + 1 S + 4 O = 7 atoms per molecule.\n' +
      'Step 2 — atoms per mole. 1 mol of H₂SO₄ = 7 mol of atoms.\n' +
      'Step 3 — 0.5 mol. 0.5 × 7 = 3.5 mol of atoms.\n' +
      'Step 4 — convert. 3.5 × 6.022 × 10²³ = 2.107 × 10²⁴ atoms.\n' +
      'Common trap: using 6 atoms per molecule and forgetting the coefficient in front. Always count each element separately.',
    timeLimit: 60,
  },
  {
    id: 'c2', topic: 'Mole concept · oxygen atoms',
    prompt: 'The number of moles of oxygen atoms in 32 g of O₂ gas is:',
    choices: ['1', '2', '0.5', '4'],
    correctIndex: 1,
    explanation:
      'Step 1 — moles of O₂. Molar mass of O₂ = 32 g/mol. So 32 g = 1 mol O₂ molecules.\n' +
      'Step 2 — atoms of oxygen. Each O₂ molecule has 2 O atoms. So 1 mol O₂ = 2 mol O atoms.\n' +
      'Common trap: reporting 1 mol. The question asks for oxygen ATOMS, not molecules.',
    timeLimit: 30,
  },
  {
    id: 'c3', topic: 'Mole concept · empirical formula',
    prompt: 'A compound has 40% C, 6.67% H, and 53.33% O by mass. Its empirical formula is:',
    choices: ['CH₂O', 'C₂H₄O', 'CH₄O', 'C₂H₆O'],
    correctIndex: 0,
    explanation:
      'Step 1 — divide by atomic masses. C: 40/12 = 3.33; H: 6.67/1 = 6.67; O: 53.33/16 = 3.33.\n' +
      'Step 2 — divide by smallest. 3.33/3.33 : 6.67/3.33 : 3.33/3.33 = 1 : 2 : 1.\n' +
      'Step 3 — empirical formula. CH₂O.\n' +
      'Common trap: forgetting to divide by the smallest ratio. Also, if the final numbers are fractional, multiply by the denominator to get whole numbers.',
    timeLimit: 75,
  },
  {
    id: 'c4', topic: 'Mole concept · limiting reagent',
    prompt: 'In the reaction N₂ + 3H₂ → 2NH₃, if 28 g N₂ reacts with 4 g H₂, the limiting reagent is:',
    choices: ['N₂', 'H₂', 'Both', 'Neither'],
    correctIndex: 1,
    explanation:
      'Step 1 — moles available. N₂ = 28/28 = 1 mol. H₂ = 4/2 = 2 mol.\n' +
      'Step 2 — stoichiometric requirement. 1 mol N₂ requires 3 mol H₂.\n' +
      'Step 3 — compare. We have only 2 mol H₂, less than required. H₂ runs out first.\n' +
      'So H₂ is the limiting reagent.\n' +
      'Common trap: comparing raw masses (28 vs 4) instead of moles. Always work in moles.',
    timeLimit: 60,
  },
  {
    id: 'c5', topic: 'Structure of atom · quantum numbers',
    prompt: 'What are the four quantum numbers for the last (valence) electron of sodium (Z = 11)?',
    choices: [
      'n=3, l=0, m=0, s=+½',
      'n=3, l=1, m=0, s=+½',
      'n=2, l=0, m=0, s=+½',
      'n=3, l=0, m=1, s=−½',
    ],
    correctIndex: 0,
    explanation:
      'Step 1 — electronic configuration. Na: 1s² 2s² 2p⁶ 3s¹.\n' +
      'Step 2 — identify the valence shell. The last electron is in the 3s orbital.\n' +
      'Step 3 — read off quantum numbers. n = 3 (shell), l = 0 (s-orbital), m = 0 (only ml for l=0), s = +½ (unpaired, convention).\n' +
      'Common trap: mistaking 3s for 3p. Remember s has l = 0, p has l = 1.',
    timeLimit: 60,
  },
  {
    id: 'c6', topic: 'Structure of atom · Bohr energy',
    prompt: 'The energy of an electron in the nth Bohr orbit of hydrogen is Eₙ = −13.6/n² eV. What is the energy required to move the electron from n=1 to n=3?',
    choices: ['13.6 eV', '12.09 eV', '10.2 eV', '3.4 eV'],
    correctIndex: 1,
    explanation:
      'Step 1 — E₁ = −13.6/1² = −13.6 eV.\n' +
      'Step 2 — E₃ = −13.6/3² = −13.6/9 ≈ −1.51 eV.\n' +
      'Step 3 — energy required. ΔE = E₃ − E₁ = (−1.51) − (−13.6) = +12.09 eV. Positive means energy is absorbed.\n' +
      'Common trap: subtracting in the wrong order and reporting a negative number. Energy absorbed is positive.',
    timeLimit: 60,
    diagram: 'bohr',
  },
  {
    id: 'c7', topic: 'Structure of atom · de Broglie',
    prompt: 'The de Broglie wavelength of an electron accelerated through a potential difference of 100 V is approximately:',
    choices: ['1.23 Å', '12.3 Å', '0.123 Å', '123 Å'],
    correctIndex: 0,
    explanation:
      'Step 1 — formula. λ = h / √(2meV) reduces to λ = 12.27/√V Å for an electron.\n' +
      'Step 2 — plug in V = 100. λ = 12.27/10 = 1.227 Å ≈ 1.23 Å.\n' +
      'Remember: the 12.27 factor is specific to electrons. For protons, use 0.286/√V Å.',
    timeLimit: 60,
  },
  {
    id: 'c8', topic: 'Structure of atom · uncertainty',
    prompt: 'According to Heisenberg\'s uncertainty principle, which pair of quantities CANNOT both be measured simultaneously with arbitrary precision?',
    choices: ['Position and momentum', 'Position and time', 'Momentum and energy', 'Energy and time'],
    correctIndex: 0,
    explanation:
      'Step 1 — Heisenberg\'s relation. Δx · Δp ≥ h/4π.\n' +
      'Step 2 — interpretation. Position and momentum are conjugate variables. The more precisely you know one, the less precisely you know the other.\n' +
      'Note: ΔE · Δt ≥ h/4π is a related relation but time is not an operator in quantum mechanics, so position-momentum is the canonical statement.\n' +
      'Common trap: confusing with energy-time, which is also quoted but has different philosophical status.',
    timeLimit: 45,
  },
  {
    id: 'c9', topic: 'Periodic properties · ionization enthalpy',
    prompt: 'Arrange in increasing order of first ionization enthalpy: B, C, N, O.',
    choices: ['B < C < N < O', 'B < C < O < N', 'O < N < C < B', 'C < B < N < O'],
    correctIndex: 1,
    explanation:
      'Step 1 — general trend. Across a period, IE increases because nuclear charge grows while shielding stays roughly constant.\n' +
      'Step 2 — anomalies. N has a half-filled 2p³ configuration (extra stability). Removing an electron from N costs more energy than from O.\n' +
      'Step 3 — the actual sequence. B (2p¹) < C (2p²) < O (2p⁴) < N (2p³, half-filled).\n' +
      'Memorise the anomalies: Be > B, N > O, Mg > Al, P > S. These are the standard JEE traps.',
    timeLimit: 75,
    diagram: 'periodic-trend',
  },
  {
    id: 'c10', topic: 'Periodic properties · ionic radius',
    prompt: 'The ionic radius of Na⁺ is smaller than that of Na because:',
    choices: [
      'Na⁺ has fewer electrons',
      'Na⁺ has the same nuclear charge but fewer electrons, so the effective nuclear charge per electron is higher',
      'Na⁺ has more protons than Na',
      'Neither — Na and Na⁺ have the same radius',
    ],
    correctIndex: 1,
    explanation:
      'Step 1 — what changes. Na → Na⁺ + e⁻. The nucleus is unchanged (11 protons). Only one electron is removed.\n' +
      'Step 2 — effect on the electron cloud. Fewer electrons sharing the same nuclear charge means each remaining electron feels a stronger pull. The cloud contracts.\n' +
      'Step 3 — conclusion. r(Na⁺) < r(Na).\n' +
      'Common trap: thinking the number of protons changes. It doesn\'t. Only electrons are added or removed in ion formation. Proton number is fixed by the element.',
    timeLimit: 60,
  },
];

/* ==================================================================== */
/* MATHS — relations & functions, trigonometry, quadratic equations      */
/* ==================================================================== */

const JEE_MATHS: JeeQ[] = [
  {
    id: 'm1', topic: 'Relations · number of relations',
    prompt: 'If A = {1, 2, 3}, how many relations can be defined on A?',
    choices: ['8', '64', '512', '9'],
    correctIndex: 2,
    explanation:
      'Step 1 — Cartesian product. A × A has 3 × 3 = 9 elements (ordered pairs).\n' +
      'Step 2 — a relation on A is any subset of A × A.\n' +
      'Step 3 — number of subsets of a 9-element set. 2⁹ = 512.\n' +
      'Memorise: number of relations on a set of n elements = 2^(n²).',
    timeLimit: 45,
  },
  {
    id: 'm2', topic: 'Functions · injective/surjective',
    prompt: 'The function f : ℝ → ℝ defined by f(x) = x² is:',
    choices: ['Injective only', 'Surjective only', 'Bijective', 'Neither injective nor surjective'],
    correctIndex: 3,
    explanation:
      'Step 1 — injective? f(−1) = f(1) = 1, but −1 ≠ 1. So different inputs give the same output. Not injective.\n' +
      'Step 2 — surjective? Range of f is [0, ∞), but codomain is ℝ. Negative reals are not in the range. Not surjective.\n' +
      'Step 3 — conclusion. Neither injective nor surjective.\n' +
      'If instead f : ℝ → [0, ∞) with f(x) = x², then it becomes surjective (but still not injective). Domain and codomain matter.',
    timeLimit: 60,
    diagram: 'quadratic-curve',
  },
  {
    id: 'm3', topic: 'Functions · composition',
    prompt: 'If f(x) = 2x + 3 and g(x) = x², then (f ∘ g)(x) equals:',
    choices: ['2x² + 3', '(2x + 3)²', '4x² + 12x + 9', 'x² + 2x + 3'],
    correctIndex: 0,
    explanation:
      'Step 1 — definition of composition. (f ∘ g)(x) = f(g(x)).\n' +
      'Step 2 — substitute. f(g(x)) = 2·g(x) + 3 = 2x² + 3.\n' +
      'Common trap: computing (g ∘ f)(x) = (2x + 3)² which is option B. Composition is not commutative.',
    timeLimit: 45,
  },
  {
    id: 'm4', topic: 'Trigonometry · compound angle',
    prompt: 'The value of sin 75° is:',
    choices: ['(√6 + √2)/4', '(√6 − √2)/4', '(√3 + 1)/4', '(√3 − 1)/4'],
    correctIndex: 0,
    explanation:
      'Step 1 — write 75° as a compound angle. 75° = 45° + 30°.\n' +
      'Step 2 — apply sin(A + B) = sin A cos B + cos A sin B.\n' +
      'Step 3 — plug in. sin 75° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4.\n' +
      'Also note: sin 75° = cos 15°. Both give (√6 + √2)/4. Verify with a calculator: sin 75° ≈ 0.9659, and (√6 + √2)/4 ≈ (2.449 + 1.414)/4 ≈ 0.966.',
    timeLimit: 60,
    diagram: 'triangle',
  },
  {
    id: 'm5', topic: 'Trigonometry · general solution',
    prompt: 'The general solution of sin x = 1/2 is:',
    choices: ['x = nπ + (−1)ⁿ · π/6', 'x = nπ + π/6', 'x = 2nπ + π/6', 'x = nπ − π/6'],
    correctIndex: 0,
    explanation:
      'Step 1 — the base solution. The principal solution is x = π/6 (since sin 30° = 1/2).\n' +
      'Step 2 — general solution for sin. If sin x = sin α, then x = nπ + (−1)ⁿ α.\n' +
      'Step 3 — apply. x = nπ + (−1)ⁿ (π/6), where n ∈ ℤ.\n' +
      'Why not just nπ + π/6? Because sin is symmetric about π/2, giving the second family of solutions. The (−1)ⁿ flips sign on alternate n, capturing both families.',
    timeLimit: 60,
  },
  {
    id: 'm6', topic: 'Trigonometry · quadrant sign',
    prompt: 'If tan A = 3/4 and A lies in the third quadrant, then sin A is:',
    choices: ['3/5', '−3/5', '4/5', '−4/5'],
    correctIndex: 1,
    explanation:
      'Step 1 — sign in third quadrant. Both sin and cos are negative in QIII, so tan A = +3/4 is consistent (negative ÷ negative = positive).\n' +
      'Step 2 — build the triangle. tan A = opposite/adjacent = 3/4 → hypotenuse = 5.\n' +
      'Step 3 — sin A = opposite/hypotenuse = 3/5, but signs in QIII make it −3/5.\n' +
      'Common trap: forgetting to apply the quadrant sign. Always sketch the angle first.',
    timeLimit: 60,
    diagram: 'triangle',
  },
  {
    id: 'm7', topic: 'Quadratic · roots',
    prompt: 'The roots of x² − 5x + 6 = 0 are:',
    choices: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'],
    correctIndex: 0,
    explanation:
      'Step 1 — factor. x² − 5x + 6 = (x − 2)(x − 3).\n' +
      'Step 2 — roots. x = 2 or x = 3.\n' +
      'Verification: sum of roots = 5 = −(−5)/1 ✓. Product = 6 = 6/1 ✓.',
    timeLimit: 30,
  },
  {
    id: 'm8', topic: 'Quadratic · symmetric functions',
    prompt: 'If α and β are roots of x² − 3x + 2 = 0, then α² + β² is:',
    choices: ['5', '7', '9', '4'],
    correctIndex: 0,
    explanation:
      'Step 1 — Vieta\'s formulas. α + β = 3 (from −b/a), αβ = 2 (from c/a).\n' +
      'Step 2 — use the identity. α² + β² = (α + β)² − 2αβ = 3² − 2(2) = 9 − 4 = 5.\n' +
      'Common trap: computing (α + β)² = 9 and stopping there. You must subtract 2αβ.',
    timeLimit: 60,
  },
  {
    id: 'm9', topic: 'Quadratic · complex roots',
    prompt: 'The quadratic equation whose roots are 2 + i and 2 − i is:',
    choices: ['x² − 4x + 5 = 0', 'x² + 4x + 5 = 0', 'x² − 4x − 5 = 0', 'x² + 4x − 5 = 0'],
    correctIndex: 0,
    explanation:
      'Step 1 — sum of roots. (2 + i) + (2 − i) = 4.\n' +
      'Step 2 — product of roots. (2 + i)(2 − i) = 4 − i² = 4 + 1 = 5.\n' +
      'Step 3 — construct the equation. x² − (sum)x + product = 0 → x² − 4x + 5 = 0.\n' +
      'Note: complex roots always appear in conjugate pairs when coefficients are real.',
    timeLimit: 60,
    diagram: 'quadratic-curve',
  },
  {
    id: 'm10', topic: 'Quadratic · discriminant',
    prompt: 'If the quadratic equation ax² + bx + c = 0 has real and equal roots, then:',
    choices: ['b² − 4ac > 0', 'b² − 4ac = 0', 'b² − 4ac < 0', 'b² − 4ac = 1'],
    correctIndex: 1,
    explanation:
      'Step 1 — discriminant. D = b² − 4ac governs the nature of the roots.\n' +
      'Step 2 — cases.\n' +
      '• D > 0 → two distinct real roots.\n' +
      '• D = 0 → two equal real roots.\n' +
      '• D < 0 → two complex conjugate roots.\n' +
      'Step 3 — for real and equal, D = 0.\n' +
      'Geometric meaning: the parabola touches the x-axis at exactly one point (a tangent point).',
    timeLimit: 30,
    diagram: 'quadratic-curve',
  },
];

const SUBJECTS: Record<Subject, { questions: JeeQ[]; label: string; hue: string; sub: string }> = {
  physics:   { questions: JEE_PHYSICS,   label: 'Physics',   hue: '234 88 12',  sub: 'Projectile, Newton, relative velocity' },
  chemistry: { questions: JEE_CHEMISTRY, label: 'Chemistry', hue: '124 58 237', sub: 'Mole concept, atom, periodic table' },
  maths:     { questions: JEE_MATHS,     label: 'Maths',     hue: '13 148 136', sub: 'Relations, trigonometry, quadratics' },
};

/* ==================================================================== */
/* Diagram renderer                                                     */
/* ==================================================================== */

const Diagram: React.FC<{ kind: NonNullable<JeeQ['diagram']> }> = ({ kind }) => {
  const stroke = 'currentColor';
  return (
    <div className="mt-5 rounded-2xl border border-token bg-surface-2 p-4">
      <svg viewBox="0 0 400 200" className="h-auto w-full text-token-2" fill="none" strokeWidth={1.5}>
        {kind === 'cliff-angled' && (
          <>
            <path d="M20 170 L20 60 L100 60 L100 170" stroke={stroke} fill="rgba(100,116,139,0.12)" />
            <path d="M100 60 L400 60" stroke={stroke} strokeDasharray="3 4" opacity="0.3" />
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M100 60 Q170 20 230 60 T340 170" stroke="#ea580c" strokeWidth={2} fill="none" />
            <circle cx="100" cy="60" r="3" fill="#ea580c" />
            <text x="108" y="52" fontSize="10" fill="currentColor" stroke="none">30°</text>
            <path d="M100 60 L130 42" stroke="#ea580c" strokeDasharray="3 3" />
            <path d="M15 60 L15 170" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="18" y="120" fontSize="10" fill="currentColor" stroke="none">80 m</text>
            <path d="M100 185 L340 185" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="215" y="198" fontSize="10" fill="currentColor" stroke="none">R = ?</text>
          </>
        )}
        {kind === 'horizontal-launch' && (
          <>
            <path d="M60 60 L60 170 L100 170 L100 60 Z" stroke={stroke} fill="rgba(100,116,139,0.12)" />
            <path d="M0 60 L60 60" stroke={stroke} strokeWidth={2} />
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M60 40 Q200 40 260 170" stroke="#ea580c" strokeWidth={2} fill="none" />
            <circle cx="60" cy="40" r="3" fill="#ea580c" />
            <path d="M60 40 L120 40" stroke="#38bdf8" strokeWidth={2} />
            <text x="90" y="32" fontSize="10" fill="#38bdf8" stroke="none">10 m/s</text>
            <path d="M50 40 L50 170" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="20" y="110" fontSize="10" fill="currentColor" stroke="none">20 m</text>
            <path d="M260 170 L310 170" stroke="#38bdf8" strokeWidth={2} />
            <path d="M260 170 L260 120" stroke="#22c55e" strokeWidth={2} />
            <text x="315" y="174" fontSize="10" fill="#38bdf8" stroke="none">vₓ</text>
            <text x="246" y="115" fontSize="10" fill="#22c55e" stroke="none">v_y</text>
          </>
        )}
        {kind === 'complementary' && (
          <>
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M40 170 Q140 60 240 170" stroke="#ea580c" strokeWidth={2} fill="none" />
            <text x="140" y="66" fontSize="10" fill="#ea580c" stroke="none">θ₁ = 30°</text>
            <path d="M40 170 Q90 20 240 170" stroke="#7c3aed" strokeWidth={2} fill="none" />
            <text x="80" y="26" fontSize="10" fill="#7c3aed" stroke="none">θ₂ = 60°</text>
            <circle cx="40" cy="170" r="3" fill="currentColor" />
            <path d="M140 170 L140 110" stroke="#ea580c" strokeDasharray="3 3" opacity="0.6" />
            <path d="M90 170 L90 60" stroke="#7c3aed" strokeDasharray="3 3" opacity="0.6" />
            <text x="145" y="145" fontSize="10" fill="#ea580c" stroke="none">H₁ = 4 m</text>
            <text x="14" y="100" fontSize="10" fill="#7c3aed" stroke="none">H₂ = 12 m</text>
          </>
        )}
        {kind === 'rain-man' && (
          <>
            {[40, 90, 140, 190, 240, 290, 340].map((x, i) => (
              <path key={i} d={`M${x} 30 L${x - 12} 70`} stroke="#60a5fa" strokeWidth={1.5} opacity={0.7} />
            ))}
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <circle cx="200" cy="80" r="10" stroke={stroke} fill="none" />
            <path d="M200 90 L200 130" stroke={stroke} strokeWidth={2} />
            <path d="M200 130 L190 170 M200 130 L210 170" stroke={stroke} strokeWidth={2} />
            <path d="M200 100 L180 90" stroke={stroke} strokeWidth={2} />
            <path d="M170 60 Q180 30 200 30 Q220 30 230 60 Z" fill="#f43f5e" opacity={0.6} stroke="#f43f5e" />
            <path d="M180 90 L185 40" stroke={stroke} strokeWidth={1.5} />
            <path d="M300 30 L300 70" stroke="#60a5fa" strokeWidth={2} />
            <text x="305" y="55" fontSize="10" fill="#60a5fa" stroke="none">v_rain = 4</text>
            <path d="M300 90 L340 90" stroke="#22c55e" strokeWidth={2} />
            <text x="310" y="106" fontSize="10" fill="#22c55e" stroke="none">v_man = 3</text>
          </>
        )}
        {kind === 'river-cross' && (
          <>
            <path d="M0 30 L400 30" stroke="#22c55e" strokeWidth={3} />
            <path d="M0 170 L400 170" stroke="#22c55e" strokeWidth={3} />
            <rect x="0" y="30" width="400" height="140" fill="rgba(56,189,248,0.08)" />
            {[60, 110, 160].map((y, i) => (
              <path key={i} d={`M${40 + i * 8} ${y} L${130 + i * 8} ${y}`} stroke="#38bdf8" strokeWidth={1.5} opacity={0.7} />
            ))}
            <text x="60" y="100" fontSize="10" fill="#38bdf8" stroke="none">flow 3 km/h</text>
            <path d="M200 30 L140 170" stroke="#ea580c" strokeWidth={2} />
            <circle cx="200" cy="30" r="3" fill="#ea580c" />
            <text x="205" y="24" fontSize="10" fill="#ea580c" stroke="none">target</text>
            <path d="M140 170 L110 130" stroke="#ea580c" strokeWidth={2} />
            <text x="80" y="135" fontSize="10" fill="#ea580c" stroke="none">v_boat 5 km/h</text>
          </>
        )}
        {kind === 'parabola' && (
          <>
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M40 170 Q200 -10 360 170" stroke="#ea580c" strokeWidth={2} fill="none" />
            <circle cx="40" cy="170" r="3" fill="currentColor" />
            <circle cx="360" cy="170" r="3" fill="currentColor" />
            <path d="M200 170 L200 80" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="210" y="125" fontSize="10" fill="currentColor" stroke="none">H = 20 m</text>
            <path d="M40 188 L360 188" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="185" y="198" fontSize="10" fill="currentColor" stroke="none">R = 40 m</text>
          </>
        )}
        {kind === 'hill-launch' && (
          <>
            <path d="M0 170 L100 60 L100 170" stroke={stroke} fill="rgba(100,116,139,0.12)" />
            <path d="M100 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M100 60 Q180 10 240 60 T340 170" stroke="#ea580c" strokeWidth={2} fill="none" />
            <circle cx="100" cy="60" r="3" fill="#ea580c" />
            <text x="105" y="52" fontSize="10" fill="#ea580c" stroke="none">30°</text>
            <path d="M100 60 L140 40" stroke="#ea580c" strokeDasharray="3 3" />
            <text x="110" y="30" fontSize="10" fill="#ea580c" stroke="none">30 m/s</text>
            <text x="40" y="120" fontSize="10" fill="currentColor" stroke="none">h = ?</text>
            <path d="M100 185 L340 185" stroke={stroke} strokeDasharray="3 3" opacity="0.6" />
            <text x="210" y="198" fontSize="10" fill="currentColor" stroke="none">120 m</text>
          </>
        )}
        {kind === 'block-force' && (
          <>
            <path d="M30 130 L270 130" stroke={stroke} strokeWidth={2} />
            <rect x="120" y="90" width="60" height="40" stroke={stroke} strokeWidth={2} fill="rgba(100,116,139,0.15)" />
            <text x="140" y="115" fontSize="10" fill="currentColor" stroke="none">5 kg</text>
            <path d="M180 90 L230 60" stroke="#ea580c" strokeWidth={2} />
            <text x="185" y="52" fontSize="10" fill="#ea580c" stroke="none">F = 40 N</text>
            <text x="195" y="75" fontSize="9" fill="#ea580c" stroke="none">37°</text>
            <path d="M150 90 L150 60" stroke="#38bdf8" strokeWidth={2} />
            <text x="155" y="55" fontSize="10" fill="#38bdf8" stroke="none">N</text>
            <path d="M150 130 L150 165" stroke="#22c55e" strokeWidth={2} />
            <text x="155" y="160" fontSize="10" fill="#22c55e" stroke="none">mg</text>
            <path d="M120 130 L80 130" stroke="#f43f5e" strokeWidth={2} />
            <text x="55" y="145" fontSize="10" fill="#f43f5e" stroke="none">f</text>
          </>
        )}
        {kind === 'pulley' && (
          <>
            <path d="M100 20 L300 20" stroke={stroke} strokeWidth={2} />
            <circle cx="200" cy="60" r="20" stroke={stroke} strokeWidth={2} fill="rgba(100,116,139,0.1)" />
            <circle cx="200" cy="60" r="3" fill={stroke} />
            <path d="M180 60 L180 130" stroke={stroke} strokeWidth={1.5} />
            <path d="M220 60 L220 90" stroke={stroke} strokeWidth={1.5} />
            <rect x="165" y="130" width="30" height="30" stroke="#38bdf8" fill="rgba(56,189,248,0.15)" strokeWidth={1.5} />
            <text x="170" y="152" fontSize="10" fill="#38bdf8" stroke="none">3 kg</text>
            <rect x="200" y="90" width="40" height="40" stroke="#22c55e" fill="rgba(34,197,94,0.15)" strokeWidth={1.5} />
            <text x="205" y="115" fontSize="10" fill="#22c55e" stroke="none">5 kg</text>
            <path d="M150 145 L150 120" stroke="#38bdf8" strokeWidth={1.5} />
            <path d="M260 110 L260 140" stroke="#22c55e" strokeWidth={1.5} />
          </>
        )}
        {kind === 'boat-minpath' && (
          <>
            <path d="M0 30 L400 30" stroke="#22c55e" strokeWidth={3} />
            <path d="M0 170 L400 170" stroke="#22c55e" strokeWidth={3} />
            <rect x="0" y="30" width="400" height="140" fill="rgba(56,189,248,0.08)" />
            <path d="M200 30 L200 170" stroke={stroke} strokeDasharray="3 3" opacity={0.5} />
            {[60, 110, 160].map((y, i) => (
              <path key={i} d={`M${40 + i * 8} ${y} L${130 + i * 8} ${y}`} stroke="#38bdf8" strokeWidth={1.5} opacity={0.7} />
            ))}
            <path d="M200 170 L190 130" stroke="#ea580c" strokeWidth={2} />
            <text x="130" y="150" fontSize="10" fill="#ea580c" stroke="none">v_boat</text>
            <path d="M200 170 L200 30" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 3" />
            <text x="205" y="100" fontSize="10" fill="#22c55e" stroke="none">shortest path</text>
          </>
        )}
        {kind === 'bohr' && (
          <>
            <circle cx="80" cy="100" r="12" fill="#ea580c" opacity={0.15} stroke="#ea580c" strokeWidth={1.5} />
            <text x="70" y="104" fontSize="10" fill="#ea580c" stroke="none">H⁺</text>
            {[45, 75, 110].map((r, i) => (
              <circle key={i} cx="80" cy="100" r={r} stroke={stroke} strokeDasharray={i === 0 ? undefined : '3 3'} opacity={i === 0 ? 1 : 0.4} fill="none" />
            ))}
            <circle cx="80" cy="55" r="4" fill="#38bdf8" />
            <text x="88" y="58" fontSize="10" fill="#38bdf8" stroke="none">n = 1</text>
            <circle cx="80" cy="190" r="3" fill="#22c55e" opacity={0.7} />
            <text x="88" y="193" fontSize="10" fill="#22c55e" stroke="none">n = 3</text>
            <path d="M80 55 Q140 30 80 190" stroke="#f43f5e" strokeDasharray="3 3" opacity={0.7} />
            <text x="150" y="30" fontSize="10" fill="#f43f5e" stroke="none">ΔE = ?</text>
            <text x="200" y="100" fontSize="11" fill="currentColor" stroke="none">Eₙ = −13.6/n² eV</text>
            <text x="200" y="120" fontSize="10" fill="currentColor" opacity={0.7} stroke="none">E₁ = −13.6 eV</text>
            <text x="200" y="135" fontSize="10" fill="currentColor" opacity={0.7} stroke="none">E₃ ≈ −1.51 eV</text>
            <text x="200" y="155" fontSize="10" fill="#f43f5e" stroke="none">ΔE ≈ 12.09 eV (absorbed)</text>
          </>
        )}
        {kind === 'periodic-trend' && (
          <>
            <text x="20" y="20" fontSize="10" fill="currentColor" stroke="none">increasing IE →</text>
            <path d="M20 30 L380 30" stroke={stroke} strokeWidth={1} markerEnd="url(#arrow)" />
            {['B', 'C', 'N', 'O'].map((el, i) => {
              const x = 80 + i * 75;
              return (
                <g key={el}>
                  <circle cx={x} cy={100} r="24" stroke={stroke} fill="rgba(100,116,139,0.1)" />
                  <text x={x} y={105} fontSize="16" textAnchor="middle" fill="currentColor" stroke="none">{el}</text>
                </g>
              );
            })}
            <text x="80" y="150" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">2p¹</text>
            <text x="155" y="150" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">2p²</text>
            <text x="230" y="150" fontSize="10" textAnchor="middle" fill="#e11d48" stroke="none">2p³ (half-filled)</text>
            <text x="305" y="150" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">2p⁴</text>
            <text x="230" y="175" fontSize="10" textAnchor="middle" fill="#e11d48" stroke="none">extra stability → higher IE</text>
          </>
        )}
        {kind === 'triangle' && (
          <>
            <path d="M60 170 L200 170 L200 40 Z" stroke={stroke} strokeWidth={2} fill="none" />
            <path d="M190 170 L190 160 L200 160" stroke={stroke} strokeWidth={1} />
            <text x="120" y="185" fontSize="11" fill="currentColor" stroke="none">adjacent</text>
            <text x="215" y="110" fontSize="11" fill="currentColor" stroke="none">opposite</text>
            <text x="105" y="95" fontSize="11" fill="currentColor" stroke="none">hypotenuse</text>
            <text x="75" y="160" fontSize="11" fill="#ea580c" stroke="none">θ</text>
            <path d="M75 170 A 20 20 0 0 0 80 158" stroke="#ea580c" fill="none" />
          </>
        )}
        {kind === 'quadratic-curve' && (
          <>
            <path d="M0 170 L400 170" stroke={stroke} strokeWidth={2} />
            <path d="M200 20 L200 190" stroke={stroke} strokeWidth={1} opacity={0.4} />
            <path d="M60 30 Q200 220 340 30" stroke="#ea580c" strokeWidth={2} fill="none" />
            <circle cx="110" cy="170" r="4" fill="#22c55e" />
            <circle cx="290" cy="170" r="4" fill="#22c55e" />
            <text x="100" y="190" fontSize="10" fill="#22c55e" stroke="none">α</text>
            <text x="288" y="190" fontSize="10" fill="#22c55e" stroke="none">β</text>
            <text x="200" y="14" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">y = ax² + bx + c</text>
            <text x="200" y="196" fontSize="9" textAnchor="middle" fill="currentColor" opacity={0.7} stroke="none">roots where curve meets x-axis</text>
          </>
        )}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

/* ==================================================================== */
/* Main view                                                            */
/* ==================================================================== */

export const RankedView: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('exam');
  const [exam, setExam] = useState<Exam>('jee');
  const [subject, setSubject] = useState<Subject>('physics');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{ qid: string; choice: number; correct: boolean; time: number }>>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  const questions = SUBJECTS[subject].questions;
  const current = questions[qIndex];
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  useEffect(() => {
    if (phase !== 'quiz' || !current) return undefined;
    setTimeLeft(current.timeLimit);
    setQuestionStartedAt(Date.now());
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          setAnswers((prev) => [
            ...prev,
            { qid: current.id, choice: -1, correct: false, time: current.timeLimit },
          ]);
          advanceOrFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex, subject]);

  const advanceOrFinish = () => {
    setSelected(null);
    if (qIndex + 1 >= questions.length) setPhase('review');
    else setQIndex((i) => i + 1);
  };

  const pick = (i: number) => {
    if (selected !== null || !current) return;
    const timeTaken = Math.round((Date.now() - questionStartedAt) / 1000);
    const correct = i === current.correctIndex;
    setSelected(i);
    setAnswers((prev) => [...prev, { qid: current.id, choice: i, correct, time: timeTaken }]);
    window.setTimeout(() => advanceOrFinish(), 1400);
  };

  const restartAll = () => {
    setPhase('exam');
    setQIndex(0);
    setSelected(null);
    setAnswers([]);
  };

  /* ---------- Exam selection ---------- */
  if (phase === 'exam') {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-token-3">
            Exam practice
          </div>
          <h1 className="mt-3 font-serif text-4xl tracking-editorial text-token sm:text-5xl">
            Choose your track
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <TrackCard
            active={exam === 'jee'}
            hue="234 88 12"
            title="JEE"
            sub="Mains · PCM"
            body="Physics, Chemistry, and Maths. Ten problems per subject with worked solutions."
            badge="Ready"
            onClick={() => setExam('jee')}
          />
          <TrackCard
            hue="124 58 237"
            title="NEET"
            sub="Biology · Physics · Chemistry"
            body="Question bank in preparation. Coming soon."
            badge="In development"
            disabled
          />
          <TrackCard
            hue="13 148 136"
            title="Basics"
            sub="Foundation"
            body="Class 11 fundamentals. Coming soon."
            badge="In development"
            disabled
          />
        </div>

        {exam === 'jee' && (
          <div className="mt-10 rounded-3xl border border-token bg-surface p-8 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-token">JEE · Mains</div>
                <div className="mt-1 text-[13px] text-token-2">
                  Three subjects · Ten questions each · Detailed explanations with diagrams
                </div>
              </div>
              <button
                onClick={() => setPhase('subject')}
                className="rounded-2xl px-6 py-3 text-[14px] font-bold text-white shadow-elev transition-all hover:shadow-lux"
                style={{ background: 'rgb(234 88 12)' }}
              >
                Choose subject
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Subject selection ---------- */
  if (phase === 'subject') {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <button
          onClick={() => setPhase('exam')}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-token bg-surface px-4 py-2 text-[12.5px] font-semibold text-token-2 transition-colors hover:border-strong hover:text-token"
        >
          ← Back to exam
        </button>
        <div className="mb-10">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-token-3">
            JEE Mains
          </div>
          <h1 className="mt-3 font-serif text-4xl tracking-editorial text-token sm:text-5xl">
            Pick a subject
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {(Object.keys(SUBJECTS) as Subject[]).map((s) => {
            const meta = SUBJECTS[s];
            return (
              <TrackCard
                key={s}
                hue={meta.hue}
                title={meta.label}
                sub={`${meta.questions.length} questions`}
                body={meta.sub}
                badge="Ready"
                active={subject === s}
                onClick={() => setSubject(s)}
              />
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-token bg-surface p-8 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-token">
                {SUBJECTS[subject].label} · {questions.length} questions
              </div>
              <div className="mt-1 text-[13px] text-token-2">
                Timed · Worked answers with diagrams at the end
              </div>
            </div>
            <button
              onClick={() => {
                setQIndex(0);
                setAnswers([]);
                setSelected(null);
                setPhase('quiz');
              }}
              className="rounded-2xl px-6 py-3 text-[14px] font-bold text-white shadow-elev transition-all hover:shadow-lux"
              style={{ background: `rgb(${SUBJECTS[subject].hue})` }}
            >
              Start quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Quiz ---------- */
  if (phase === 'quiz' && current) {
    const pct = (timeLeft / current.timeLimit) * 100;
    const tone = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#e11d48';

    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-token-3">
            {SUBJECTS[subject].label} · Q {qIndex + 1} / {questions.length}
          </div>
          <div className="font-mono text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: tone }}>
            {timeLeft}s
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(qIndex / questions.length) * 100}%`, background: `rgb(${SUBJECTS[subject].hue})` }} />
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: tone }} />
        </div>

        <div className="mt-8 rounded-3xl border border-token bg-surface p-6 shadow-soft sm:p-8">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-token-3">
            {current.topic}
          </div>
          <p className="mt-4 text-[17px] leading-relaxed text-token sm:text-[18px]">
            {current.prompt}
          </p>

          {current.diagram ? <Diagram kind={current.diagram} /> : null}

          <div className="mt-7 space-y-2.5">
            {current.choices.map((c, i) => {
              const isSelected = selected === i;
              const isCorrect = i === current.correctIndex;
              const revealed = selected !== null;

              let style: React.CSSProperties | undefined;
              let tone2 = 'border-token hover:border-strong bg-surface';
              if (revealed && isCorrect) {
                style = { borderColor: '#22c55e', background: 'rgba(34,197,94,0.08)' };
              } else if (revealed && isSelected && !isCorrect) {
                style = { borderColor: '#e11d48', background: 'rgba(225,29,72,0.08)' };
              }
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={revealed}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left text-[15px] transition-all disabled:cursor-default ${tone2}`}
                  style={style}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-token bg-surface-2 font-mono text-[12px] font-bold text-token-2">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-token">{c}</span>
                  {revealed && isCorrect ? <span className="text-lg text-emerald-500">✓</span> : null}
                  {revealed && isSelected && !isCorrect ? <span className="text-lg text-rose-500">✕</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Review ---------- */
  const accuracy = Math.round((score / questions.length) * 100);
  const totalTime = answers.reduce((a, b) => a + b.time, 0);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-token bg-surface p-8 shadow-elev sm:p-10">
        <div className="text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-token-3">
            {SUBJECTS[subject].label} · set complete
          </div>
          <div className="mt-6 font-serif text-6xl text-token sm:text-7xl">
            {score}<span className="text-token-3">/{questions.length}</span>
          </div>
          <div className="mt-3 text-[14px] text-token-2">
            Accuracy <span className="font-bold text-token">{accuracy}%</span> · Total time{' '}
            <span className="font-bold text-token">{Math.floor(totalTime / 60)}m {totalTime % 60}s</span>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          {questions.map((q, idx) => {
            const a = answers[idx];
            if (!a) return null;
            const good = a.correct;
            return (
              <div
                key={q.id}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: good ? 'rgba(34,197,94,0.35)' : 'rgba(225,29,72,0.35)',
                  background: good ? 'rgba(34,197,94,0.05)' : 'rgba(225,29,72,0.05)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-token-3">
                      Q{idx + 1} · {q.topic}
                    </div>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-token">
                      {q.prompt}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold text-white"
                    style={{ background: good ? '#22c55e' : '#e11d48' }}
                  >
                    {good ? 'CORRECT' : 'WRONG'}
                  </span>
                </div>

                {q.diagram ? <Diagram kind={q.diagram} /> : null}

                <div className="mt-5 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
                  <div className="rounded-xl border border-token bg-surface px-3.5 py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-token-3">
                      Correct answer
                    </div>
                    <div className="mt-1 font-mono font-semibold text-token">
                      {String.fromCharCode(65 + q.correctIndex)}. {q.choices[q.correctIndex]}
                    </div>
                  </div>
                  <div className="rounded-xl border border-token bg-surface px-3.5 py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-token-3">
                      Your answer
                    </div>
                    <div className="mt-1 font-mono font-semibold" style={{ color: good ? 'rgb(var(--text))' : '#e11d48' }}>
                      {a.choice === -1 ? 'Not answered' : `${String.fromCharCode(65 + a.choice)}. ${q.choices[a.choice]}`}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-token bg-surface-2 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-token-3">
                    Detailed solution
                  </div>
                  <div className="mt-2 space-y-2">
                    {q.explanation.split('\n').map((line, k) => (
                      <p key={k} className="text-[13.5px] leading-relaxed text-token-2">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={restartAll}
          className="mt-8 w-full rounded-2xl py-4 text-[15px] font-bold text-white shadow-elev transition-all hover:shadow-lux"
          style={{ background: `rgb(${SUBJECTS[subject].hue})` }}
        >
          Start over
        </button>
      </div>
    </div>
  );
};

/* ---------- Track card ---------- */

const TrackCard: React.FC<{
  hue: string;
  title: string;
  sub: string;
  body: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ hue, title, sub, body, badge, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-start rounded-3xl border p-6 text-left transition-all ${
      disabled
        ? 'cursor-not-allowed border-token bg-surface/60 opacity-70'
        : active
          ? 'shadow-elev'
          : 'border-token bg-surface hover:-translate-y-0.5 hover:shadow-elev'
    }`}
    style={active ? { borderColor: `rgb(${hue})`, background: `rgb(${hue} / 0.06)` } : undefined}
  >
    <div className="flex w-full items-center justify-between">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl font-serif text-2xl italic text-white"
        style={{ background: `rgb(${hue})` }}
      >
        {title[0]}
      </div>
      {badge ? (
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{
            background: disabled ? 'rgb(var(--surface-2))' : `rgb(${hue})`,
            color: disabled ? 'rgb(var(--text-3))' : 'white',
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
    <div className="mt-5 text-lg font-bold text-token">{title}</div>
    <div className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-token-3">
      {sub}
    </div>
    <p className="mt-3 text-[13.5px] leading-relaxed text-token-2">{body}</p>
  </button>
);