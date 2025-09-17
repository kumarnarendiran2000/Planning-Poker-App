import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import { validateUserName, clearErrorOnInput } from '../../utils/formValidation';

/**
 * Modal for entering a user's name to join a room
 */
function NameModal({ isOpen, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  /**
   * Handle OK button click
   */
  const handleModalOk = () => {
    const validation = validateUserName(name);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    // Clear any previous errors
    setError('');
    onSubmit(name);
    setName('');
  };

  /**
   * Handle key press in input field
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleModalOk();
    }
  };

  /**
   * Handle input change
   */
  const handleNameChange = (e) => {
    setName(e.target.value);
    // Clear error when user starts typing
    setError(clearErrorOnInput(e.target.value, error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Clear any errors before closing
        setError('');
        onClose();
      }}
      title="🎯 Enter Your Name"
      showCancel={true}
      showOk={true}
      okText="🚀 Join Room"
      onOk={handleModalOk}
      type="confirm"
    >
      <div className="py-2">
        <p className="text-gray-700 mb-6 leading-relaxed">
          Welcome to this Planning Poker session! Please enter your name to join the team and start estimating.
        </p>
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-800 font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">👤</span>
            Your Name
          </label>
          <input
            type="text"
            id="name"
            className={`w-full px-4 py-3 border-2 ${
              error 
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
            } rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 text-gray-800 placeholder-gray-400 font-medium`}
            placeholder="e.g., John Doe"
            value={name}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {error && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-bounce">
              <p className="text-sm text-red-700 font-medium flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-blue-700 text-sm font-medium flex items-center">
            <span className="mr-2">💡</span>
            Tip: Use your real name so team members can easily identify you!
          </p>
        </div>
      </div>
    </Modal>
  );
}

NameModal.propTypes = {
  /** Whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when name is submitted */
  onSubmit: PropTypes.func.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired
};

/**
 * Default props for the NameModal component
 */
NameModal.defaultProps = {
  isOpen: false
};

export default NameModal;