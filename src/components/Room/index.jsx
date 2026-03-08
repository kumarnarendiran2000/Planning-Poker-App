import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import enhancedToast from '../../utils/enhancedToast.jsx';
import useRoom from '../../hooks/useRoom';
import useVoting from '../../hooks/useVoting';
import RoomService from '../../services/roomService';
import { countVotes } from '../../utils/statistics';
import { useAlertModal } from '../modals/AlertModal';
import { isUserParticipant, clearRoomData, markRoomLeaving } from '../../utils/localStorage';
import { useFeedback } from '../../hooks/useFeedback';

// Refactored sub-components
import RoomLoadingState from './RoomLoadingState';
import RoomErrorState from './RoomErrorState';
import RoomHeader from './RoomHeader';
import StoryInput from './StoryInput';
import RoomMainContent from './RoomMainContent';
import RoomModals from './RoomModals';
import RevealCountdown from '../common/RevealCountdown';
import ResetLoader from '../common/ResetLoader';
import FeedbackButton from '../common/FeedbackButton';
import LeaveRoomModal from '../modals/LeaveRoomModal';
import ConnectionBanner from '../common/ConnectionBanner';
import useConnectionStatus from '../../hooks/useConnectionStatus';

/**
 * Room component - the main component for a planning poker room
 * Refactored into smaller focused components for better maintainability
 */
const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

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
    resetState,
    story,
    updateStory,
    userName
  } = useRoom(roomId, { showError, showConfirm, showSuccess });

  // Track Firebase connection state
  const { isOnline } = useConnectionStatus();

  // Use feedback hook for feedback operations
  const { getUserRole } = useFeedback();

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
  } = useVoting(roomId, sessionId, participants, revealed, isHost, story, { showError, showConfirm, showSuccess });

  // Get vote counts
  const { votesSubmitted, totalParticipants } = countVotes(participants);

  // Determine if current user participates in voting (for header badge)
  const currentUser = participants[sessionId];
  const isParticipantFromFirebase = currentUser?.isParticipant !== false;
  const isParticipantFromStorage = isUserParticipant(roomId);
  const isParticipant = currentUser ? isParticipantFromFirebase : isParticipantFromStorage;

  // Get user role for feedback context
  const userRole = getUserRole(isHost, isParticipant);

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

    try {
      // Get host's name for the notification
      const hostName = participants[sessionId]?.name || 'Host';

      // Kick the participant (now includes email notifications)
      await RoomService.kickParticipant(roomId, participantId, hostName, participantName);

      // NOTE: Success toast shown by useRoomSubscription when it detects participant removal
    } catch (error) {
      console.error('Error removing participant:', error);
      enhancedToast.error(`Failed to remove participant: ${error.message}`);
    }
  }, [isHost, roomId, participants, sessionId]);

  /**
   * Handle promoting a participant to host (host only)
   * ALWAYS transfers ownership - only ONE host allowed at a time
   * @param {string} participantId - The participant to promote
   * @param {string} participantName - The participant's name
   * @param {boolean} canVote - Whether the new host can vote (true = Host Participant, false = Facilitator)
   */
  /**
   * Handle promoting a participant to host (host only)
   * ALWAYS transfers ownership - only ONE host allowed at a time
   * @param {string} participantId - The participant to promote
   * @param {string} participantName - The participant's name
   * @param {boolean} canVote - Whether the new host can vote (true = Host Participant, false = Facilitator)
   */
  const handlePromoteToHost = useCallback(async (participantId, participantName, canVote) => {
    if (!isHost || !roomId) {
      return;
    }

    try {
      const hostName = participants[sessionId]?.name || 'Host';

      // ALWAYS transfer: Promote target and demote self (atomic operation)
      // This ensures only ONE host exists at any time
      await RoomService.promoteToHost(roomId, participantId, canVote, hostName);
      await RoomService.demoteFromHost(roomId, sessionId, hostName);

      // NOTE: Success toast shown by useRoomSubscription when it detects role changes
    } catch (error) {
      console.error('Error updating host role:', error);
      enhancedToast.error(`Failed: ${error.message}`);
    }
  }, [isHost, roomId, participants, sessionId]);

  /**
   * Handle leave room button click
   * For hosts/facilitators - show transfer modal
   * For participants - show confirmation and leave
   */
  const handleLeaveRoom = useCallback(() => {
    if (isHost) {
      // Host must transfer role first
      setShowLeaveModal(true);
    } else {
      // Regular participant — confirm then leave
      showConfirm({
        title: 'Leave Room',
        message: 'Are you sure you want to leave this room?',
        okText: 'Leave',
        cancelText: 'Stay',
        onOk: async () => {
          const loadingToast = enhancedToast.loading('Leaving room...');
          try {
            markRoomLeaving(roomId); // Suppress subscription "removed by host" toast
            await RoomService.removeParticipant(roomId, sessionId, userName, 'left');
            clearRoomData(roomId);
            enhancedToast.dismiss(loadingToast);
            navigate('/');
          } catch (error) {
            console.error('Error leaving room:', error);
            enhancedToast.dismiss(loadingToast);
            enhancedToast.error('Failed to leave room. Please try again.');
          }
        }
      });
    }
  }, [isHost, roomId, sessionId, userName, showConfirm, navigate]);

  /**
   * Handle transfer and leave (for hosts/facilitators)
   * @param {string|null} participantId - ID of participant to transfer to (null if no participants)
   * @param {string|null} participantName - Name of participant to transfer to
   * @param {boolean} canVote - Whether new host can vote
   */
  const handleTransferAndLeave = useCallback(async (participantId, participantName, canVote) => {
    setIsTransferring(true);
    const hostName = participants[sessionId]?.name || 'Host';
    const loadingToast = enhancedToast.loading(
      participantId ? `Transferring role to ${participantName}...` : 'Leaving room...'
    );

    try {
      markRoomLeaving(roomId); // Suppress subscription role-change & removal toasts

      if (participantId) {
        // Transfer role then remove self
        await RoomService.promoteToHost(roomId, participantId, canVote, hostName);
        await RoomService.demoteFromHost(roomId, sessionId, hostName);
        await RoomService.removeParticipant(roomId, sessionId, hostName, 'left');
      } else {
        // No other participants — delete the room
        await RoomService.deleteRoom(roomId, hostName);
      }

      clearRoomData(roomId);
      enhancedToast.dismiss(loadingToast);
      setShowLeaveModal(false);
      setIsTransferring(false);
      navigate('/');
    } catch (error) {
      console.error('Error leaving room:', error);
      enhancedToast.dismiss(loadingToast);
      enhancedToast.error('Failed to leave room. Please try again.');
      setIsTransferring(false);
    }
  }, [roomId, sessionId, participants, navigate]);

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
      <ConnectionBanner isOnline={isOnline} />
      <div className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-12 py-3 sm:py-4 md:py-6 min-h-screen max-w-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col">

          {/* Room Header */}
          <div className="flex-shrink-0 mb-3 sm:mb-4 md:mb-6">
            <RoomHeader roomId={roomId} isHost={isHost} isParticipant={isParticipant} participantCount={totalParticipants} />
          </div>

          {/* Story Input */}
          <div className="flex-shrink-0 mb-3 sm:mb-4 md:mb-6">
            <StoryInput
              storyName={story}
              isHost={isHost}
              onStoryUpdate={updateStory}
              disabled={loading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[500px] sm:min-h-[600px]">
            <RoomMainContent
              participants={participants}
              sessionId={sessionId}
              roomId={roomId}
              revealed={revealed}
              isHost={isHost}
              onRemoveParticipant={handleRemoveParticipant}
              onPromoteToHost={handlePromoteToHost}
              showConfirm={showConfirm}
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
              onLeaveRoom={handleLeaveRoom}
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

      {/* Leave Room Modal (for hosts/facilitators) */}
      <LeaveRoomModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        participants={participants}
        sessionId={sessionId}
        onTransferAndLeave={handleTransferAndLeave}
        isTransferring={isTransferring}
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

      {/* Feedback Button - Available for all users */}
      <FeedbackButton
        roomId={roomId}
        userRole={userRole}
        userName={userName}
      />
    </div>
  );
};

export default Room;