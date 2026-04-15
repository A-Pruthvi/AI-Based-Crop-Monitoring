import React from 'react';

/**
 * Loader Component - Loading spinner with multiple variants and sizes
 * 
 * @param {string} variant - Loader style: 'spinner', 'dots', 'pulse', 'bars'
 * @param {string} size - Loader size: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color: 'primary', 'secondary', 'white', 'success', 'danger'
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {string} text - Loading text
 * @param {string} className - Additional CSS classes
 */

const Loader = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
  className = '',
}) => {
  // Size dimensions
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Colors
  const colors = {
    primary: 'text-primary-600 border-primary-600',
    secondary: 'text-secondary-600 border-secondary-600',
    white: 'text-white border-white',
    success: 'text-green-600 border-green-600',
    danger: 'text-red-600 border-red-600',
  };

  // Spinner Loader
  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className={`text-sm font-medium ${colors[color]}`}>{text}</p>}
    </div>
  );

  // Dots Loader
  const DotsLoader = () => {
    const dotSize = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-6 h-6',
    };

    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex space-x-2">
          <div className={`${dotSize[size]} bg-current ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`${dotSize[size]} bg-current ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`${dotSize[size]} bg-current ${colors[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
        {text && <p className={`text-sm font-medium ${colors[color]}`}>{text}</p>}
      </div>
    );
  };

  // Pulse Loader
  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} rounded-full bg-current ${colors[color]} animate-ping`} />
      {text && <p className={`text-sm font-medium ${colors[color]}`}>{text}</p>}
    </div>
  );

  // Bars Loader
  const BarsLoader = () => {
    const barSizes = {
      xs: 'w-1 h-6',
      sm: 'w-1.5 h-8',
      md: 'w-2 h-12',
      lg: 'w-3 h-16',
      xl: 'w-4 h-24',
    };

    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex items-end space-x-1">
          <div className={`${barSizes[size]} bg-current ${colors[color]} rounded animate-pulse`} style={{ animationDelay: '0ms' }} />
          <div className={`${barSizes[size]} bg-current ${colors[color]} rounded animate-pulse`} style={{ animationDelay: '150ms' }} />
          <div className={`${barSizes[size]} bg-current ${colors[color]} rounded animate-pulse`} style={{ animationDelay: '300ms' }} />
          <div className={`${barSizes[size]} bg-current ${colors[color]} rounded animate-pulse`} style={{ animationDelay: '450ms' }} />
        </div>
        {text && <p className={`text-sm font-medium ${colors[color]}`}>{text}</p>}
      </div>
    );
  };

  // Select loader variant
  const LoaderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'spinner':
      default:
        return <SpinnerLoader />;
    }
  };

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <LoaderVariant />
        </div>
      </div>
    );
  }

  // Inline loader
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderVariant />
    </div>
  );
};

export default Loader;
