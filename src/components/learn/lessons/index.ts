import type { ComponentType } from 'react';
import { L01_WhatIsMotion } from './L01_WhatIsMotion';
import { L02_EquationsOfMotion } from './L02_EquationsOfMotion';
import { L03_MotionGraphs } from './L03_MotionGraphs';
import { L04_Vectors } from './L04_Vectors';
import { L05_RelativeVelocity } from './L05_RelativeVelocity';
import { L06_ProjectileBasics } from './L06_ProjectileBasics';
import { L07_FromHeight } from './L07_FromHeight';
import { L08_OnIncline } from './L08_OnIncline';
import { L09_RelativeProjectile } from './L09_RelativeProjectile';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export interface LessonMeta {
  id: string;
  number: string;
  title: string;
  summary: string;
  section: 'Foundations' | 'Tools' | 'Projectile Motion' | 'Advanced';
  status: 'ready' | 'in-progress';
  Component?: ComponentType<LessonNavProps>;
}

export const LESSONS: LessonMeta[] = [
  { id: 'motion-basics', number: '01', title: 'What is motion?', summary: 'Frames of reference, displacement, velocity, acceleration.', section: 'Foundations', status: 'ready', Component: L01_WhatIsMotion },
  { id: 'equations', number: '02', title: 'Equations of motion', summary: 'The three kinematic equations, derived.', section: 'Foundations', status: 'ready', Component: L02_EquationsOfMotion },
  { id: 'graphs', number: '03', title: 'Motion graphs', summary: 'Reading x–t, v–t, a–t plots like a physicist.', section: 'Foundations', status: 'ready', Component: L03_MotionGraphs },
  { id: 'vectors', number: '04', title: 'Vectors & components', summary: 'Resolving vectors, adding them, and why it matters.', section: 'Tools', status: 'ready', Component: L04_Vectors },
  { id: 'relative-velocity', number: '05', title: 'Relative velocity', summary: 'Frames of reference and the river-boat problem.', section: 'Tools', status: 'ready', Component: L05_RelativeVelocity },
  { id: 'projectile-basics', number: '06', title: 'Projectile motion', summary: 'Full derivations of T, H, R, and the trajectory equation.', section: 'Projectile Motion', status: 'ready', Component: L06_ProjectileBasics },
  { id: 'from-height', number: '07', title: 'Projectile from a height', summary: 'Launching from an elevated platform — flight time, range, angle sweep.', section: 'Projectile Motion', status: 'ready', Component: L07_FromHeight },
  { id: 'on-incline', number: '08', title: 'Projectile on an incline', summary: 'Rotated coordinates, the tilted parabola, and the α = 45° + θ/2 rule.', section: 'Projectile Motion', status: 'ready', Component: L08_OnIncline },
  { id: 'relative-projectile', number: '09', title: 'Relative projectile motion', summary: 'Two projectiles in air. Why relative motion is a straight line.', section: 'Advanced', status: 'ready', Component: L09_RelativeProjectile },
];