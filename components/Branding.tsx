
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Krypto AI - The Stellar Navigator
 * Abstract architectural beacon for career engineering.
 * Symbolic of guidance, upward mobility, and technical precision.
 */
export const KryptoLogo: React.FC<LogoProps> = ({ className = "w-10 h-10", size = 40 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="gold-nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
      
      <filter id="core-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* The Upward Path (The "North" Trajectory) */}
    <path 
      d="M50 5L35 35L50 28L65 35L50 5Z" 
      fill="url(#gold-nav-gradient)"
      className="animate-pulse"
    />
    
    {/* Secondary Paths (Cardinal Directions) */}
    {/* East */}
    <path 
      d="M95 50L65 40V60L95 50Z" 
      fill="url(#gold-nav-gradient)" 
      fillOpacity="0.4"
    />
    {/* West */}
    <path 
      d="M5 50L35 40V60L5 50Z" 
      fill="url(#gold-nav-gradient)" 
      fillOpacity="0.4"
    />
    {/* South */}
    <path 
      d="M50 95L40 65H60L50 95Z" 
      fill="url(#gold-nav-gradient)" 
      fillOpacity="0.7"
    />

    {/* The Central Intelligence Core */}
    <g filter="url(#core-glow)">
      {/* Outer Prism Ring */}
      <rect 
        x="38" y="38" width="24" height="24" 
        rx="4" 
        transform="rotate(45 50 50)" 
        stroke="url(#gold-nav-gradient)" 
        strokeWidth="2.5"
      />
      {/* Inner Beacon */}
      <circle 
        cx="50" cy="50" r="5" 
        fill="url(#gold-nav-gradient)" 
      />
    </g>

    {/* Connection/Architecture Lines */}
    <path 
      d="M50 28V38" 
      stroke="url(#gold-nav-gradient)" 
      strokeWidth="1.5" 
      strokeDasharray="2 2" 
      opacity="0.5"
    />
    <path 
      d="M50 62V75" 
      stroke="url(#gold-nav-gradient)" 
      strokeWidth="1.5" 
      strokeDasharray="2 2" 
      opacity="0.5"
    />
  </svg>
);
