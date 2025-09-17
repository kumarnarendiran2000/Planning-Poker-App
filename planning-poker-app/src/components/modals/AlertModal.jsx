import React, { useState } from 'react';
import Modal from '../common/Modal';

/**
 * Custom hook for creating and managing alert modals
 * 
 * @returns {Object} Alert modal utilities
 */
export const useAlertModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'default',
    onOk: () => {},
    okText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
  });

  /**
   * Show a generic alert modal
   * 
   * @param {string|Object} message - Message string or config object
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving when user responds
   */
  const showAlert = (message, options = {}) => {
    // Handle both object and string format
    const config = typeof message === 'string' 
      ? { message, ...options }
      : message;
    
    setConfig(config);
    setIsOpen(true);
    return new Promise((resolve) => {
      const originalOnOk = config.onOk || (() => {});
      setConfig({
        ...config,
        onOk: () => {
          originalOnOk();
          resolve(true);
          setIsOpen(false);
        }
      });
    });
  };

  /**
   * Show a confirmation modal with OK/Cancel buttons
   * 
   * @param {string|Object} message - Message string or config object
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving to boolean based on user choice
   */
  const showConfirm = (message, options = {}) => {
    // Handle both object and string format
    const config = typeof message === 'string' 
      ? { message, ...options }
      : message;
    
    const confirmConfig = {
      ...config,
      type: 'confirm',
      showCancel: true,
    };
    setConfig(confirmConfig);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      const originalOnOk = config.onOk || (() => {});
      setConfig({
        ...confirmConfig,
        onOk: () => {
          originalOnOk();
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
    });
  };

  /**
   * Show an error modal
   * 
   * @param {string|Object} message - Message string or config object
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving when user responds
   */
  const showError = (message, options = {}) => {
    if (typeof message === 'string') {
      return showAlert(message, { ...options, type: 'error' });
    }
    return showAlert({ ...message, type: 'error' });
  };

  /**
   * Show a warning modal
   * 
   * @param {string|Object} message - Message string or config object
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving when user responds
   */
  const showWarning = (message, options = {}) => {
    if (typeof message === 'string') {
      return showAlert(message, { ...options, type: 'warning' });
    }
    return showAlert({ ...message, type: 'warning' });
  };

  /**
   * Show a success modal
   * 
   * @param {string|Object} message - Message string or config object
   * @param {Object} options - Additional options
   * @returns {Promise} Promise resolving when user responds
   */
  const showSuccess = (message, options = {}) => {
    if (typeof message === 'string') {
      return showAlert(message, { ...options, type: 'success' });
    }
    return showAlert({ ...message, type: 'success' });
  };

  /**
   * Close the modal manually
   */
  const closeModal = () => {
    setIsOpen(false);
  };

  /**
   * Alert modal component to render with enhanced styling
   */
  const AlertModalComponent = () => (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (config.showCancel) {
          setIsOpen(false);
        }
      }}
      title={config.title}
      type={config.type}
      onOk={config.onOk}
      okText={config.okText}
      cancelText={config.cancelText}
      showCancel={config.showCancel}
    >
      <div className="py-2">
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-base">{config.message}</p>
        </div>
        
        {/* Enhanced styling based on modal type */}
        {config.type === 'error' && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-r-xl">
            <p className="text-red-700 text-sm font-medium flex items-center">
              <span className="mr-2">🚨</span>
              Please review the error details above and try again.
            </p>
          </div>
        )}
        
        {config.type === 'success' && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-xl">
            <p className="text-green-700 text-sm font-medium flex items-center">
              <span className="mr-2">🎉</span>
              Operation completed successfully!
            </p>
          </div>
        )}
        
        {config.type === 'warning' && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-xl">
            <p className="text-amber-700 text-sm font-medium flex items-center">
              <span className="mr-2">⚡</span>
              Please proceed with caution.
            </p>
          </div>
        )}
        
        {config.type === 'confirm' && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-xl">
            <p className="text-blue-700 text-sm font-medium flex items-center">
              <span className="mr-2">🤔</span>
              Please confirm your choice to continue.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );

  return {
    AlertModal: AlertModalComponent,
    showAlert,
    showConfirm,
    showError,
    showWarning,
    showSuccess,
    closeModal
  };
};

export default useAlertModal;