import { useState, useCallback, useEffect, useMemo } from 'react';
import RoomService from '../services/roomService';
import { calculateStatistics } from '../utils/statistics';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Custom hook for managing voting operations
 * 
 * @param {string} roomId - The room ID
 * @param {string} sessionId - The user's session ID
 * @param {Object} participants - The room participants
 * @param {boolean} revealed - Whether votes are revealed
 * @param {boolean} isHost - Whether the current user is the host
 * @param {Object} alertFunctions - Alert functions from useAlertModal
 * @returns {Object} Voting state and operations
 */
const useVoting = (roomId, sessionId, participants, revealed, isHost, alertFunctions) => {
  const [vote, setVote] = useState(null);
  const { showError, showConfirm, showSuccess } = alertFunctions;

  /**
   * Update the local vote state based on participant data
   */
  const updateLocalVote = useCallback(() => {
    if (participants && sessionId && participants[sessionId]) {
      const participantVote = participants[sessionId].vote;
      // Only update if vote actually changed to prevent unnecessary re-renders
      setVote(prevVote => prevVote !== participantVote ? participantVote : prevVote);
    } else if (participants && sessionId && !participants[sessionId]) {
      // Participant was removed, clear their vote
      setVote(null);
    }
  }, [participants, sessionId]);
  
  // Call updateLocalVote when participants or sessionId changes
  useEffect(() => {
    updateLocalVote();
  }, [updateLocalVote]);

  /**
   * Submit a vote
   * 
   * @param {string} value - The vote value
   */
  const handleVote = async (value) => {
    try {
      if (revealed) {
        showError({
          title: 'Voting Closed',
          message: 'Voting is closed. Wait for the host to reset the votes.',
          okText: 'OK'
        });
        return;
      }
      
      // Prevent voting if already skipped
      if (vote === 'SKIP') {
        showError({
          title: 'Already Skipped',
          message: 'You have skipped this round. Wait for the host to reset the votes.',
          okText: 'OK'
        });
        return;
      }
      
      // Submit to Firebase first, let Firebase listener update local state
      await RoomService.submitVote(roomId, sessionId, value);
      // Remove: setVote(value); - let Firebase listener handle this
    } catch (error) {
      showError({
        title: 'Error',
        message: 'Failed to submit vote: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Skip voting for current participant
   */
  const handleSkip = async () => {
    try {
      if (revealed) {
        showError({
          title: 'Voting Closed',
          message: 'Voting is closed. Wait for the host to reset the votes.',
          okText: 'OK'
        });
        return;
      }
      
      // Submit to Firebase first, let Firebase listener update local state
      await RoomService.skipVote(roomId, sessionId);
      // Remove: setVote('SKIP'); - let Firebase listener handle this
    } catch (error) {
      showError({
        title: 'Error',
        message: 'Failed to skip vote: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Unskip voting (remove skip status and allow voting again)
   */
  const handleUnskip = async () => {
    try {
      if (revealed) {
        showError({
          title: 'Voting Closed',
          message: 'Voting is closed. Wait for the host to reset the votes.',
          okText: 'OK'
        });
        return;
      }
      
      // Submit to Firebase first, let Firebase listener update local state
      await RoomService.unskipVote(roomId, sessionId);
      // Remove: setVote(null); - let Firebase listener handle this
    } catch (error) {
      showError({
        title: 'Error',
        message: 'Failed to unskip vote: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Reveal all votes (host only) - now with countdown
   */
  const handleReveal = async () => {
    if (!isHost) {
      showError({
        title: 'Not Authorized',
        message: 'Only the host can reveal votes.',
        okText: 'OK'
      });
      return;
    }
    
    // Start countdown by setting it in Firebase
    try {
      await RoomService.startRevealCountdown(roomId);
    } catch (error) {
      showError({
        title: 'Error',
        message: 'Failed to start countdown: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Actually reveal votes after countdown completes
   */
  const executeReveal = async () => {
    try {
      await RoomService.revealVotes(roomId);
      await RoomService.stopRevealCountdown(roomId);
    } catch (error) {
      console.error('Error revealing votes:', error);
      showError({
        title: 'Error',
        message: 'Failed to reveal votes: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Cancel the countdown
   */
  const cancelCountdown = async () => {
    try {
      await RoomService.stopRevealCountdown(roomId);
    } catch (error) {
      console.error('Error canceling countdown:', error);
    }
  };

  /**
   * Reset all votes (host only) - with enhanced UX flow
   */
  const handleReset = async () => {
    if (!isHost) {
      showError({
        title: 'Not Authorized',
        message: 'Only the host can reset votes.',
        okText: 'OK'
      });
      return;
    }
    
    try {
      // Ask for confirmation before resetting
      const confirmed = await showConfirm({
        title: 'Reset Votes',
        message: 'Are you sure you want to reset all votes? This will clear everyone\'s selections.',
        okText: 'Yes, Reset Votes',
        cancelText: 'Cancel'
      });
      
      if (!confirmed) {
        return;
      }
      
      // Start reset state so all participants see loading
      await RoomService.startResetState(roomId);
      
      // Reset the votes (no artificial delays)
      await RoomService.resetVotes(roomId);
      // Remove: setVote(null); - let Firebase listener handle this
      
      // Stop reset state immediately after reset completes
      await RoomService.stopResetState(roomId);
      
      // Show success toast for host
      enhancedToast.success('Reset complete! Votes have been cleared.');
      
    } catch (error) {
      console.error('Error resetting votes:', error);
      
      // Make sure to stop reset state even on error
      try {
        await RoomService.stopResetState(roomId);
      } catch (stopError) {
        console.error('Error stopping reset state:', stopError);
      }
      
      showError({
        title: 'Error',
        message: 'Failed to reset votes: ' + error.message,
        okText: 'OK'
      });
    }
  };

  /**
   * Calculate statistics from participant data
   * Include the revealed state in the dependency array to ensure stats are recalculated when votes are revealed
   */
  const stats = useMemo(() => {
    return calculateStatistics(participants, revealed);
  }, [participants, revealed]);

  return {
    vote,
    handleVote,
    handleSkip,
    handleUnskip,
    handleReveal,
    handleReset,
    stats,
    executeReveal,
    cancelCountdown
  };
};

export default useVoting;