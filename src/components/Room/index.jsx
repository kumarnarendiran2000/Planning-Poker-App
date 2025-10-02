import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import enhancedToast from '../../utils/enhancedToast.jsx';
import useRoom from '../../hooks/useRoom';
import useVoting from '../../hooks/useVoting';
import RoomService from '../../services/roomService';
import { countVotes } from '../../utils/statistics';
import { useAlertModal } from '../modals/AlertModal';
import { isUserParticipant } from '../../utils/localStorage';

// Refactored sub-components
import RoomLoadingState from './RoomLoadingState';
import RoomErrorState from './RoomErrorState';
import RoomHeader from './RoomHeader';
import RoomMainContent from './RoomMainContent';
import RoomModals from './RoomModals';
import RevealCountdown from '../common/RevealCountdown';
import ResetLoader from '../common/ResetLoader';

/**
 * Room component - the main component for a planning poker room
 * Refactored into smaller focused components for better maintainability
 */
const Room = () => {
  const { roomId } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize AlertModal
  const { AlertModal, showError, showConfirm, showSuccess } = useAlertModal();
  
  // Use the room hook to manage room state
  const {
    loading,
    roomExists,
    participants,
    revealed,
    showNameModal,
    sessionId,
    isHost,
    joinRoom,
    deleteRoom,
    countdown,
    resetState
  } = useRoom(roomId, { showError, showConfirm, showSuccess });
  
  // Use the voting hook to manage voting
  const {
    vote,
    handleVote,
    handleSkip,
    handleUnskip,
    handleReveal,
    handleReset,
    stats,
    executeReveal,
    cancelCountdown
  } = useVoting(roomId, sessionId, participants, revealed, isHost, { showError, showConfirm, showSuccess });
  
  // Get vote counts
  const { votesSubmitted, totalParticipants } = countVotes(participants);
  
  // Determine if current user participates in voting (for header badge)
  const currentUser = participants[sessionId];
  const isParticipantFromFirebase = currentUser?.isParticipant !== false;
  const isParticipantFromStorage = isUserParticipant(roomId);
  const isParticipant = currentUser ? isParticipantFromFirebase : isParticipantFromStorage;
  
  /**
   * Handle delete room button click
   */
  const handleDeleteRoom = () => {
    setShowDeleteModal(true);
  };
  
  /**
   * Confirm room deletion
   */
  const confirmDeleteRoom = async () => {
    setIsDeleting(true);
    await deleteRoom();
    setIsDeleting(false);
    setShowDeleteModal(false);
  };
  
  /**
   * Handle name submission from NameModal
   */
  const handleNameSubmit = useCallback((name) => {
    joinRoom(name);
  }, [joinRoom]);
  
  /**
   * Handle removing a participant (host only)
   */
  const handleRemoveParticipant = useCallback(async (participantId, participantName) => {
    if (!isHost || !roomId) {
      return;
    }
    
    // Show confirmation modal instead of JavaScript popup
    showConfirm({
      title: 'Remove Participant',
      message: `Are you sure you want to remove ${participantName} from the room?`,
      okText: 'Remove',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Get host's name for the notification
          const hostName = participants[sessionId]?.name || 'Host';
          
          // Kick the participant (now includes email notifications)
          await RoomService.kickParticipant(roomId, participantId, hostName, participantName);
          
          // Show success notification
          enhancedToast.success(`${participantName} has been removed from the room`);
        } catch (error) {
          console.error('Error removing participant:', error);
          enhancedToast.error(`Failed to remove participant: ${error.message}`);
        }
      }
    });
  }, [isHost, roomId, participants, sessionId, showConfirm]);
  
  // Show loading state
  if (loading) {
    return <RoomLoadingState />;
  }

  // If room doesn't exist, show error state
  if (!roomExists) {
    return <RoomErrorState roomId={roomId} />;
  }

  // Render the room
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col">
      <div className="flex-1 container mx-auto px-4 sm:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 min-h-screen max-w-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 min-h-[calc(100vh-4rem)] flex flex-col">
          
          {/* Room Header */}
          <div className="flex-shrink-0 mb-4 sm:mb-6">
            <RoomHeader roomId={roomId} isHost={isHost} isParticipant={isParticipant} participantCount={totalParticipants} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[600px]">
            <RoomMainContent
            participants={participants}
            sessionId={sessionId}
            roomId={roomId}
            revealed={revealed}
            isHost={isHost}
            onRemoveParticipant={handleRemoveParticipant}
            stats={stats}
            vote={vote}
            votesSubmitted={votesSubmitted}
            totalParticipants={totalParticipants}
            onVote={handleVote}
            onSkip={handleSkip}
            onUnskip={handleUnskip}
            onReveal={handleReveal}
            onReset={handleReset}
            onDelete={handleDeleteRoom}
          />
          </div>
        </div>
      </div>
      
      {/* All Modals */}
      <RoomModals
        showNameModal={showNameModal}
        onNameSubmit={handleNameSubmit}
        onNameModalClose={() => window.location.href = '/'}
        showDeleteModal={showDeleteModal}
        onDeleteModalClose={() => setShowDeleteModal(false)}
        onDeleteConfirm={confirmDeleteRoom}
        roomId={roomId}
        isDeleting={isDeleting}
        AlertModal={AlertModal}
      />
      
      {/* Reveal Countdown */}
      <RevealCountdown
        isVisible={!!countdown?.active}
        onComplete={executeReveal}
        onCancel={cancelCountdown}
        showCancelButton={isHost}
      />
      
      {/* Reset Loader */}
      <ResetLoader
        isVisible={!!resetState?.active}
      />
    </div>
  );
};

export default Room;