import React from 'react';

export interface LogoProps {
  /** Size of the square mark in pixels. */
  size?: number;
  /** Show the "ForgeEd" wordmark next to the mark. */
  wordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 34, wordmark = true, className }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <img
      src="/logo.jpg"
      alt="ForgeEd"
      width={size}
      height={size}
      className="shrink-0 rounded-xl object-cover shadow-soft ring-1 ring-black/5"
      style={{ width: size, height: size }}
    />
    {wordmark ? (
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-editorial text-token">ForgeEd</div>
        <div className="mt-0.5 font-serif text-[11px] italic text-token-3">
          Interactive Physics
        </div>
      </div>
    ) : null}
  </div>
);