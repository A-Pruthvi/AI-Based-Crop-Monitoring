import React from 'react';

/**
 * Card Component - Reusable card container with multiple variants
 * 
 * @param {string} variant - Card style: 'default', 'bordered', 'shadow', 'hover', 'glass'
 * @param {string} padding - Padding size: 'none', 'sm', 'md', 'lg', 'xl'
 * @param {boolean} hoverable - Add hover effect
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Card content
 * @param {ReactNode} header - Card header content
 * @param {ReactNode} footer - Card footer content
 * @param {Function} onClick - Click handler
 */

const Card = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  header,
  footer,
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-white rounded-xl transition-all duration-200';

  // Variant styles
  const variants = {
    default: 'border border-secondary-200',
    bordered: 'border-2 border-secondary-300',
    shadow: 'shadow-lg border border-secondary-100',
    hover: 'border border-secondary-200 hover:shadow-xl hover:border-primary-300',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl',
  };

  // Padding styles
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effect
  const hoverStyles = hoverable || onClick ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';

  // Clickable
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      {...props}
    >
      {/* Card Header */}
      {header && (
        <div className="card-header border-b border-secondary-200 pb-4 mb-4">
          {header}
        </div>
      )}

      {/* Card Body */}
      <div className="card-body">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="card-footer border-t border-secondary-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};

// Card Title Component
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-secondary-900 ${className}`}>
    {children}
  </h3>
);

// Card Description Component
export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-secondary-600 mt-1 ${className}`}>
    {children}
  </p>
);

// Card Content Component
export const CardContent = ({ children, className = '' }) => (
  <div className={`text-secondary-700 ${className}`}>
    {children}
  </div>
);

export default Card;
