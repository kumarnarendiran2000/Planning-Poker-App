import React from 'react';
import DeleteRoomModal from '../modals/DeleteRoomModal';
import NameModal from '../modals/NameModal';

/**
 * Room modals component
 * Manages all modal dialogs for the room
 */
const RoomModals = ({ 
  showNameModal, 
  onNameSubmit, 
  onNameModalClose,
  showDeleteModal, 
  onDeleteModalClose, 
  onDeleteConfirm, 
  roomId, 
  isDeleting,
  AlertModal 
}) => {
  return (
    <>
      <NameModal 
        isOpen={showNameModal}
        onSubmit={onNameSubmit}
        onClose={onNameModalClose}
      />
      
      <DeleteRoomModal
        isOpen={showDeleteModal}
        onClose={onDeleteModalClose}
        onConfirm={onDeleteConfirm}
        roomId={roomId}
        isDeleting={isDeleting}
      />
      
      {/* Alert Modal for error messages */}
      <AlertModal />
    </>
  );
};

export default RoomModals;