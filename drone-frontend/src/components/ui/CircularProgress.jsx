import React from 'react';

const CircularProgress = ({ 
  value = 0, 
  size = 120, 
  strokeWidth = 8,
  showLabel = true,
  label,
  color = 'green',
  bgColor = 'slate',
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colors = {
    green: 'stroke-green-500',
    blue: 'stroke-blue-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500',
    orange: 'stroke-orange-500',
  };

  const bgColors = {
    slate: 'stroke-slate-200 dark:stroke-slate-700',
    green: 'stroke-green-200 dark:stroke-green-800',
    blue: 'stroke-blue-200 dark:stroke-blue-800',
  };

  const getColorByValue = (val) => {
    if (val >= 80) return colors.green;
    if (val >= 60) return colors.blue;
    if (val >= 40) return colors.yellow;
    if (val >= 20) return colors.orange;
    return colors.red;
  };

  const strokeColor = color === 'auto' ? getColorByValue(value) : colors[color] || colors.green;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={bgColors[bgColor] || bgColors.slate}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 4px currentColor)',
          }}
        />
      </svg>
      
      {/* Center Label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {Math.round(value)}%
          </span>
          {label && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
