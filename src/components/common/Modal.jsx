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

  // Enhanced modal styles with colorful borders and gradients
  const modalStyles = {
    default: {
      border: 'border-l-4 border-indigo-500',
      headerBg: 'bg-gradient-to-r from-indigo-50 to-purple-50',
      headerBorder: 'border-b border-indigo-100',
      textColor: 'text-indigo-900',
      shadow: 'shadow-indigo-100'
    },
    confirm: {
      border: 'border-l-4 border-blue-500',
      headerBg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      headerBorder: 'border-b border-blue-100',
      textColor: 'text-blue-900',
      shadow: 'shadow-blue-100'
    },
    error: {
      border: 'border-l-4 border-red-500',
      headerBg: 'bg-gradient-to-r from-red-50 to-pink-50',
      headerBorder: 'border-b border-red-100',
      textColor: 'text-red-900',
      shadow: 'shadow-red-100'
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      headerBorder: 'border-b border-amber-100',
      textColor: 'text-amber-900',
      shadow: 'shadow-amber-100'
    },
    success: {
      border: 'border-l-4 border-green-500',
      headerBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      headerBorder: 'border-b border-green-100',
      textColor: 'text-green-900',
      shadow: 'shadow-green-100'
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

  // Enhanced button styles with gradients (removed hover effects)
  const okButtonStyles = {
    default: 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg',
    confirm: 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg',
    error: 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg',
  };

  const currentStyle = modalStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced backdrop with animation */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      ></div>
      
      {/* Enhanced modal with colorful borders and animations (removed hover effects) */}
      <div className={`
        relative z-50 bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden 
        animate-modalSlideIn
        ${currentStyle.border} ${currentStyle.shadow}
        ${className}
      `}>
        {/* Enhanced Header with gradient and colorful styling */}
        {title && (
          <div className={`px-6 py-5 ${currentStyle.headerBg} ${currentStyle.headerBorder}`}>
            <div className="flex items-center">
              {icons[type]}
              <h3 className={`text-xl font-bold ${currentStyle.textColor} tracking-wide`}>
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Enhanced Body with better spacing */}
        <div className="px-6 py-5 bg-gradient-to-br from-white to-gray-50">
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