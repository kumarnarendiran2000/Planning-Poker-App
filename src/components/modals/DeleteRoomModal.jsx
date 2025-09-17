import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';

/**
 * Modal for confirming room deletion
 */
function DeleteRoomModal({ isOpen, onClose, onConfirm, roomId, isDeleting }) {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗑️ Delete Room"
      showCancel={true}
      showOk={true}
      okText={isDeleting ? "⏳ Deleting..." : "🗑️ Delete Room"}
      onOk={onConfirm}
      type="error"
    >
      <div className="py-2">
        <p className="text-gray-700 mb-6 leading-relaxed">
          Are you sure you want to permanently delete this Planning Poker room? This action cannot be undone.
        </p>
        
        <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🎯</span>
            <p className="text-red-800 font-bold text-lg">Room: {roomId}</p>
          </div>
          <div className="space-y-2 text-red-700">
            <p className="flex items-center font-medium">
              <span className="mr-2">👥</span>
              All participants will be immediately disconnected
            </p>
            <p className="flex items-center font-medium">
              <span className="mr-2">🗳️</span>
              All votes and session data will be permanently lost
            </p>
            <p className="flex items-center font-medium">
              <span className="mr-2">📊</span>
              Statistics and history will be erased
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-xl">
          <p className="text-amber-800 font-semibold flex items-center">
            <span className="mr-2">⚠️</span>
            Warning: This action is irreversible!
          </p>
        </div>
      </div>
    </Modal>
  );
}

DeleteRoomModal.propTypes = {
  /** Whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired,
  /** Function to confirm deletion */
  onConfirm: PropTypes.func.isRequired,
  /** The ID of the room to delete */
  roomId: PropTypes.string.isRequired,
  /** Whether deletion is in progress */
  isDeleting: PropTypes.bool
};

export default DeleteRoomModal;