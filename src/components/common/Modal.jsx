import React, { useEffect } from 'react';
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
  type = 'default', // 'default', 'confirm', 'error', 'warning', 'success'
  className = ''
}) => {
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

  // Enhanced modal icons with better styling
  const icons = {
    confirm: <span className="text-2xl text-blue-500 mr-3 animate-pulse">❓</span>,
    error: <span className="text-2xl text-red-500 mr-3 animate-bounce">⚠️</span>,
    warning: <span className="text-2xl text-amber-500 mr-3 animate-pulse">⚠️</span>,
    success: <span className="text-2xl text-green-500 mr-3 animate-bounce">✅</span>,
    default: <span className="text-2xl text-indigo-500 mr-3">💬</span>
  };

  // VDI-optimized button styles - simple and fast
  const okButtonStyles = {
    default: 'bg-indigo-600',
    confirm: 'bg-blue-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
    success: 'bg-green-600',
  };

  const currentStyle = modalStyles[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* VDI-optimized backdrop - simple and fast */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998]" 
        onClick={onClose}
      ></div>
      
      {/* VDI-optimized modal - no animations or complex effects */}
      <div className={`
        relative z-[10000] bg-white rounded-xl border-2 w-full max-w-md overflow-hidden 
        max-h-[90vh] overflow-y-auto
        ${currentStyle.border}
        ${className}
      `}>
        {/* Top-right close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    </div>
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
  type: PropTypes.oneOf(['default', 'confirm', 'error', 'warning', 'success']),
  /** Additional className for the modal */
  className: PropTypes.string
};

export default Modal;