import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RoomService from '../services/roomService';
import * as StorageUtils from '../utils/localStorage';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for room operations (join, delete, etc.)
 * Handles user actions within the room
 */
export const useRoomOperations = (roomId, state, navigation, alertFunctions) => {
  const { isHost, setShowNameModal, participants, sessionId } = state;
  const { navigate } = navigation;
  const { showError, showSuccess } = alertFunctions;

  /**
   * Join a room with a given name
   */
  const joinRoom = useCallback(async (name) => {
    if (!name.trim() || !roomId) return;
    
    try {
      // Check if room still exists before joining
      const roomExists = await RoomService.checkRoomExists(roomId);
      if (!roomExists) {
        // Room was deleted while user was on name modal
        enhancedToast.error('This room no longer exists. Redirecting to home page...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
        return;
      }
      
      // Generate a session ID or reuse existing one
      const existingSessionId = StorageUtils.getSessionId(roomId);
      const sessionId = existingSessionId || uuidv4().substring(0, 8);
      
      // Add participant to room with minimal data structure
      const participantData = {
        name: name.trim(),
        vote: null,
        joinedAt: Date.now()
      };
      
      await RoomService.addParticipant(roomId, sessionId, participantData);
      
      // Save to localStorage with room-specific keys
      StorageUtils.saveUserSession({
        roomId,
        sessionId,
        userName: name.trim(),
        isHost: false
      });
      
      setShowNameModal(false);
      
      // Only force reload for brand new sessions
      if (!existingSessionId) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error joining room:', error);
      showError({
        title: 'Error',
        message: 'Failed to join room: ' + error.message,
        okText: 'OK'
      });
    }
  }, [roomId, navigate, setShowNameModal, showError]);

  /**
   * Delete a room (host only)
   */
  const deleteRoom = useCallback(async () => {
    if (!isHost || !roomId) return;
    
    try {
      // Mark this room as being deleted by the user
      StorageUtils.markRoomDeleting(roomId);
      
      // First show a loading indicator
      const loadingToast = enhancedToast.loading('Deleting room...');
      
      try {
        // Get host's name for email notifications
        const hostName = participants?.[sessionId]?.name || 'Host';
        
        // Delete the room using our improved deletion method
        // (This now handles notifying clients, cleaning up participants, and sending emails)
        await RoomService.deleteRoom(roomId, hostName);
        
        // Clear the host's localStorage data immediately after successful deletion
        StorageUtils.clearRoomData(roomId);
        
        // Remove the loading indicator
        enhancedToast.dismiss(loadingToast);
        
        // Navigate back to home
        navigate('/', { replace: true });
        
        // Show success toast notification
        enhancedToast.success('Room deleted successfully');
      } catch (err) {
        // If error during deletion, dismiss loading indicator
        enhancedToast.dismiss(loadingToast);
        throw err; // Re-throw to be caught by the outer try-catch
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      showError({
        title: 'Error',
        message: 'Failed to delete room: ' + error.message,
        okText: 'OK'
      });
      // Remove the deleting marker since deletion failed
      StorageUtils.removeRoomItem('deletingRoom', roomId);
      
      // Try to update room status back to active if possible
      try {
        await RoomService.updateRoomStatus(roomId, 'active');
      } catch (e) {
        console.error('Failed to restore room status after failed deletion:', e);
      }
    }
  }, [isHost, roomId, navigate, showError, showSuccess]);

  return {
    joinRoom,
    deleteRoom
  };
};