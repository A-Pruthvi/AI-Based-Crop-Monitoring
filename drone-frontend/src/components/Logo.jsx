import React from 'react';

/**
 * CropMonitor premium logo – drone silhouette fused with a leaf.
 * Uses emerald-to-teal gradient; rendered as pure SVG so it scales cleanly.
 */
const Logo = ({ size = 'md', showText = true, variant = 'light' }) => {
  const sizes = {
    sm: { icon: 'w-9 h-9', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'w-14 h-14', text: 'text-2xl', gap: 'gap-3' },
    lg: { icon: 'w-20 h-20', text: 'text-4xl', gap: 'gap-4' },
    xl: { icon: 'w-24 h-24', text: 'text-5xl', gap: 'gap-4' },
  };

  const s = sizes[size] || sizes.md;

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-800';
  const subColor  = variant === 'light' ? 'text-white/70' : 'text-gray-500';

  return (
    <div className={`flex items-center ${s.gap}`}>
      {/* Icon badge */}
      <div className={`${s.icon} relative flex-shrink-0`}>
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30 blur-lg animate-glow-pulse" />

        {/* Badge */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-glow flex items-center justify-center overflow-hidden">
          {/* Glass gloss */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-2xl" />

          {/* Drone-leaf SVG */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/5 h-3/5 relative z-10 drop-shadow-md"
          >
            {/* Leaf shape */}
            <path
              d="M32 8C18 8 8 22 8 36c0 10 6 16 12 18 2 .7 4-1 3-3-2-6 0-14 9-20 6-4 14-5 20-2"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="white"
              fillOpacity="0.15"
            />
            {/* Leaf vein */}
            <path
              d="M20 48C24 38 28 28 32 18M26 38c4-4 10-7 16-8M22 46c6-2 12-2 18 0"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Drone body (center circle) */}
            <circle cx="42" cy="20" r="5" fill="white" fillOpacity="0.9" />
            {/* Drone arms + rotors */}
            <line x1="42" y1="20" x2="52" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="42" y1="20" x2="52" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="42" y1="20" x2="34" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="52" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
            <circle cx="52" cy="28" r="4" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
            <circle cx="34" cy="12" r="4" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
            {/* Circuit dots on leaf (AI concept) */}
            <circle cx="24" cy="40" r="1.5" fill="white" opacity="0.7" />
            <circle cx="30" cy="34" r="1.5" fill="white" opacity="0.7" />
            <circle cx="36" cy="30" r="1.5" fill="white" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${s.text} font-extrabold tracking-tight ${textColor}`}>
            Crop<span className="font-light">Monitor</span>
          </span>
          {(size === 'lg' || size === 'xl') && (
            <span className={`text-sm font-medium tracking-wide ${subColor} mt-0.5`}>
              AI-Powered Agriculture
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
