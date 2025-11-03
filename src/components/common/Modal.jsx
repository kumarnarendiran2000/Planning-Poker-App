import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Enhanced Modal component with colorful borders and smooth animations
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  okText = 'OK',
  cancelText = 'Cancel',
  onOk,
  showCancel = true,
  showOk = true,
  type = 'default', // 'default', 'create', 'confirm', 'error', 'warning', 'success'
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  className = ''
}) => {
  // Size classes for responsive design
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl', // Wider for better web experience
    xl: 'max-w-4xl', // Extra wide for detailed content
    full: 'max-w-7xl'
  };
  // Handle body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // VDI-optimized modal styles - simple and fast
  const modalStyles = {
    default: {
      border: 'border-l-4 border-indigo-500',
      headerBg: 'bg-indigo-50',
      headerBorder: 'border-b border-indigo-200',
      textColor: 'text-indigo-900'
    },
    create: {
      border: 'border-l-4 border-l-blue-500 border-t-4 border-t-indigo-500 border-r-4 border-r-purple-500',
      headerBg: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50',
      headerBorder: 'border-b-2 border-gradient-to-r from-blue-200 via-indigo-200 to-purple-200',
      textColor: 'text-indigo-900'
    },
    confirm: {
      border: 'border-l-4 border-blue-500',
      headerBg: 'bg-blue-50',
      headerBorder: 'border-b border-blue-200',
      textColor: 'text-blue-900'
    },
    error: {
      border: 'border-l-4 border-red-500',
      headerBg: 'bg-red-50',
      headerBorder: 'border-b border-red-200',
      textColor: 'text-red-900'
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      headerBg: 'bg-amber-50',
      headerBorder: 'border-b border-amber-200',
      textColor: 'text-amber-900'
    },
    success: {
      border: 'border-l-4 border-green-500',
      headerBg: 'bg-green-50',
      headerBorder: 'border-b border-green-200',
      textColor: 'text-green-900'
    }
  };

  // Modal icons - VDI optimized without animations
  const icons = {
    default: <span className="text-2xl text-indigo-500 mr-3">💬</span>,
    create: <span className="text-2xl mr-3">🚀</span>,
    confirm: <span className="text-2xl text-blue-500 mr-3">❓</span>,
    error: <span className="text-2xl text-red-500 mr-3">⚠️</span>,
    warning: <span className="text-2xl text-amber-500 mr-3">⚠️</span>,
    success: <span className="text-2xl text-green-500 mr-3">✅</span>
  };

  // VDI-optimized button styles - simple and fast
  const okButtonStyles = {
    default: 'bg-indigo-600',
    create: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700',
    confirm: 'bg-blue-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
    success: 'bg-green-600',
  };

  const currentStyle = modalStyles[type];

  // Render modal in a Portal to ensure it covers the entire screen
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" 
        onClick={onClose}
      ></div>
      
      {/* Modal container - with blurred/soft borders */}
      <div 
        className={`
          relative z-[10000] bg-white rounded-2xl w-full 
          max-h-[90vh] sm:max-h-[85vh] overflow-y-auto
          shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)]
          ${sizeClasses[size]}
          ${currentStyle.border}
          ${className}
        `}
        style={{
          filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))',
        }}
      >
        {/* Top-right close button - Enhanced visibility */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-md border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200"
          aria-label="Close modal"
          title="Close"
        >
          <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Enhanced Header with gradient and colorful styling */}
        {title && (
          <div className={`px-6 py-5 pr-12 ${currentStyle.headerBg} ${currentStyle.headerBorder}`}>
            <div className="flex items-center">
              {icons[type]}
              <h3 className={`text-xl font-bold ${currentStyle.textColor} tracking-wide`}>
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Enhanced Body with better spacing */}
        <div className={`px-6 py-5 bg-gradient-to-br from-white to-gray-50 ${!title ? 'pr-12 pt-12' : ''}`}>
          {children}
        </div>

        {/* Enhanced Footer with gradient background */}
        {(showOk || showCancel) && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-end space-x-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg shadow-md border border-gray-200 font-medium"
              >
                {cancelText}
              </button>
            )}
            {showOk && (
              <button
                onClick={onOk || onClose}
                className={`px-5 py-2.5 ${okButtonStyles[type]} text-white rounded-lg font-medium`}
              >
                {okText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  /** Whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired,
  /** Modal content */
  children: PropTypes.node,
  /** Modal title */
  title: PropTypes.string,
  /** Text for the OK button */
  okText: PropTypes.string,
  /** Text for the Cancel button */
  cancelText: PropTypes.string,
  /** Function to call when the OK button is clicked */
  onOk: PropTypes.func,
  /** Whether to show the cancel button */
  showCancel: PropTypes.bool,
  /** Whether to show the ok button */
  showOk: PropTypes.bool,
  /** Modal type affecting styling */
  type: PropTypes.oneOf(['default', 'create', 'confirm', 'error', 'warning', 'success']),
  /** Modal size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Additional className for the modal */
  className: PropTypes.string
};

export default Modal;