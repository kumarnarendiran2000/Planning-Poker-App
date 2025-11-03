import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import { validateUserName, clearErrorOnInput } from '../../utils/formValidation';

function NameModal({ isOpen, onSubmit, onClose, roomId }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleModalOk = () => {
    const validation = validateUserName(name);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    setError('');
    onSubmit(name);
    setName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleModalOk();
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError(clearErrorOnInput(e.target.value, error));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setError('');
        onClose();
      }}
      title="Join Planning Poker Room"
      showCancel={true}
      showOk={true}
      okText="Join Room"
      onOk={handleModalOk}
      type="confirm"
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleModalOk(); }} className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-2xl">👋</span>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium mb-1">
              Welcome! You are about to join the Planning Poker session.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your name below to start collaborating with your team on story estimates.
            </p>
          </div>
        </div>

        {roomId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-blue-500 text-xl">🔑</span>
              </div>
              <div className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl font-mono text-lg tracking-wider text-gray-700 font-bold">
                {roomId}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Room code detected from link
            </p>
          </div>
        )}

        <div>
          <label htmlFor="join-name-modal" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-blue-500 text-xl">👤</span>
            </div>
            <input
              id="join-name-modal"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              onKeyPress={handleKeyPress}
              required
              className={`w-full pl-12 pr-4 py-3 border-2 ${error && !name.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'} rounded-xl focus:outline-none focus:ring-2 ${error && !name.trim() ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-colors duration-200`}
              autoFocus
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Use your real name so teammates can identify you</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-sm text-red-700 flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}

NameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  roomId: PropTypes.string
};

NameModal.defaultProps = {
  isOpen: false,
  roomId: null
};

export default NameModal;