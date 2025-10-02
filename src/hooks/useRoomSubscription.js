import { useEffect, useRef } from 'react';
import RoomService from '../services/roomService';
import * as StorageUtils from '../utils/localStorage';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for managing Firebase room subscriptions
 * Handles real-time updates from Firebase for room data
 */
export const useRoomSubscription = (roomId, state, navigation) => {
  const { roomExists, sessionId, isHost, setParticipants, setRevealed, setCountdown, setResetState, setStory } = state;
  const { navigate } = navigation;
  const lastResetTimestamp = useRef(null);

  useEffect(() => {
    if (!roomExists || !sessionId) return;
    
    let unsubscribe = null;
    let isComponentMounted = true;
    
    // Subscribe to room updates
    unsubscribe = RoomService.subscribeToRoom(roomId, (snapshot) => {
      if (!isComponentMounted) return;
      
      if (!snapshot.exists()) {
        // Room was deleted from database
        
        // Check if the current user deleted the room themselves
        const deletedRoomId = StorageUtils.getRoomItem('deletingRoom', roomId);
        if (deletedRoomId !== roomId) {
          // Clear room data immediately
          StorageUtils.clearRoomData(roomId);
          
          // Don't show toast to host (they initiated the deletion)
          if (!isHost) {
            // Show toast with a brief delay before redirect to ensure it renders
            enhancedToast.error('This room has been deleted by the host. Thank you for participating!');
          }
          
          // Small delay to ensure toast renders before navigation (or immediate for host)
          const navTimer = setTimeout(() => {
            navigate('/', { replace: true });
          }, isHost ? 100 : 500); // Shorter delay for host since no toast
          
          // Store timer reference for cleanup
          if (!window.roomSubscriptionTimers) window.roomSubscriptionTimers = new Set();
          window.roomSubscriptionTimers.add(navTimer);
        } else {
          // User deleted it themselves, just navigate
          navigate('/', { replace: true });
        }
        return;
      }
      
      const roomData = snapshot.val();
      
      // Check if room is marked as deleting
      if (roomData.status === 'deleting') {
        // Check if the current user is deleting the room
        const deletedRoomId = StorageUtils.getRoomItem('deletingRoom', roomId);
        if (deletedRoomId !== roomId) {
          // Force unsubscribe from this room
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          
          // Clear any room-specific data
          StorageUtils.clearRoomData(roomId);
          
          // Don't show toast to host (they initiated the deletion)
          if (!isHost) {
            // Show toast with a brief delay before redirect to ensure it renders
            enhancedToast.warning('This room is being deleted by the host. Thank you for participating!');
          }
          
          // Small delay to ensure toast renders before navigation (or immediate for host)
          setTimeout(() => {
            navigate('/', { replace: true });
          }, isHost ? 100 : 500); // Shorter delay for host since no toast
        }
        return;
      }
      
      // Update participants data and check if current user was removed
      setParticipants(prevParticipants => {
        const newParticipants = roomData.participants || {};
        
        // Check if current user was removed by host
        const currentSessionId = StorageUtils.getSessionId(roomId);
        const currentIsHost = StorageUtils.isUserHost(roomId);
        
        if (currentSessionId && !currentIsHost) {
          const wasInRoom = prevParticipants[currentSessionId];
          const stillInRoom = newParticipants[currentSessionId];
          
          // If user was in room before but not anymore, and this isn't the initial load
          if (wasInRoom && !stillInRoom && Object.keys(prevParticipants).length > 0) {
            // User was removed by host
            enhancedToast.error('You have been removed by the host. Redirecting to home page...');
            
            // Clear localStorage immediately
            StorageUtils.clearRoomData(roomId);
            
            // Redirect after short delay to show message
            const redirectTimer = setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
            
            // Store timer reference for cleanup
            if (!window.roomSubscriptionTimers) window.roomSubscriptionTimers = new Set();
            window.roomSubscriptionTimers.add(redirectTimer);
            
            return prevParticipants; // Don't update state, we're leaving anyway
          }
        }
        
        // Shallow comparison - more efficient for VDI environments
        const prevKeys = Object.keys(prevParticipants).sort();
        const newKeys = Object.keys(newParticipants).sort();
        if (prevKeys.length === newKeys.length && 
            prevKeys.every((key, i) => key === newKeys[i] && 
                          prevParticipants[key]?.vote === newParticipants[key]?.vote &&
                          prevParticipants[key]?.name === newParticipants[key]?.name)) {
          return prevParticipants;
        }
        
        return newParticipants;
      });
      
      setRevealed(roomData.revealed || false);
      
      // Update story
      setStory(roomData.story || '');
      
      // Update countdown status
      setCountdown(roomData.countdown || null);
      
      // Update reset state
      setResetState(roomData.resetState || null);
      
      // Check for reset notifications (only for non-host participants)
      if (roomData.resetNotification && !isHost) {
        const { timestamp, notified } = roomData.resetNotification;
        
        // Get current participant's join time
        const currentParticipant = roomData.participants[sessionId];
        const participantJoinTime = currentParticipant?.joinedAt;
        
        // Only show notification if:
        // 1. It's new and hasn't been shown yet
        // 2. The participant exists and has a valid join time
        // 3. The participant was in the room BEFORE the reset happened
        // 4. This prevents new joiners from seeing old reset notifications
        if (timestamp && 
            timestamp !== lastResetTimestamp.current && 
            !notified &&
            participantJoinTime && // Ensure participant has a join time
            participantJoinTime < timestamp) { // Key fix: only show if joined before reset
          
          lastResetTimestamp.current = timestamp;
          
          // Show toast notification to participant
          enhancedToast.info('The votes have been reset by host');
          
          // Mark this participant as notified (but don't clear the notification yet)
          // Let the auto-cleanup in roomService handle the clearing after 30 seconds
        }
      }
    });
    
    // Cleanup function
    return () => {
      isComponentMounted = false;
      
      if (unsubscribe) {
        unsubscribe();
      }
      
      // Clean up any pending timers
      if (window.roomSubscriptionTimers) {
        window.roomSubscriptionTimers.forEach(timer => clearTimeout(timer));
        window.roomSubscriptionTimers.clear();
      }
      
      // Remove the deleting marker
      StorageUtils.removeRoomItem('deletingRoom', roomId);
      
      // If this was the host, check if the room is now empty and should be deleted
      // (Don't force delete on browser close - host might want to rejoin)
      if (isHost && roomId) {
        RoomService.deleteRoomIfEmpty(roomId)
          .then(wasDeleted => {
            if (wasDeleted) {
              // Room was deleted due to being empty
            }
          })
          .catch(error => {
            console.error('Error checking if room should be deleted:', error);
          });
      }
    };
  }, [roomId, roomExists, sessionId, isHost, navigate, setParticipants, setRevealed, setCountdown, setResetState]);
};