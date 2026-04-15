import React, { useEffect, useRef } from 'react';

/**
 * Modal Component - Accessible modal dialog with multiple sizes
 * 
 * @param {boolean} isOpen - Control modal visibility
 * @param {Function} onClose - Close handler
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} closeOnOverlay - Close when clicking overlay
 * @param {boolean} closeOnEsc - Close when pressing Escape
 * @param {boolean} showClose - Show close button
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} title - Modal title
 * @param {ReactNode} footer - Modal footer
 */

const Modal = ({
  isOpen = false,
  onClose,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showClose = true,
  className = '',
  children,
  title,
  footer,
}) => {
  const modalRef = useRef(null);

  // Size styles
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEsc, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`
            relative bg-white rounded-2xl shadow-2xl 
            w-full ${sizes[size]} 
            transform transition-all animate-scale-in
            ${className}
          `}
        >
          {/* Close Button */}
          {showClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Modal Header */}
          {title && (
            <div className="px-6 py-5 border-b border-secondary-200">
              <h3
                id="modal-title"
                className="text-2xl font-semibold text-secondary-900"
              >
                {title}
              </h3>
            </div>
          )}

          {/* Modal Body */}
          <div className="px-6 py-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add animations to global CSS or Tailwind config
// You can add these to your index.css or tailwind.config.js
const styles = `
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
`;

export default Modal;
