import React from 'react';

export interface TimerRingProps {
  remaining: number;
  total: number;
  size?: number;
}

export const TimerRing: React.FC<TimerRingProps> = ({ remaining, total, size = 68 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.max(remaining, 0) / total : 0;
  const dash = circumference * ratio;

  const colour = ratio > 0.5 ? '#34d399' : ratio > 0.25 ? '#fbbf24' : '#f87171';
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-sm font-semibold text-slate-100">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};