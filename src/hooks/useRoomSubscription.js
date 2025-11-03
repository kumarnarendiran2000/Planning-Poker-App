import { useEffect, useRef } from 'react';
import RoomService from '../services/roomService';
import * as StorageUtils from '../utils/localStorage';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for managing Firebase room subscriptions
 * Handles real-time updates from Firebase for room data
 */
export const useRoomSubscription = (roomId, state, navigation) => {
  const { roomExists, sessionId, isHost, setParticipants, setRevealed, setCountdown, setResetState, setStory, setIsHost } = state;
  const { navigate } = navigation;
  
  // Refs for tracking previous state and preventing duplicate toasts
  const lastResetTimestamp = useRef(0);
  const lastResetToastTime = useRef(0); // Track when reset toast was last shown
  const lastRoleChangeToast = useRef({ type: null, timestamp: 0 });
  const roleChangeDebounceTimer = useRef(null);
  const pendingRoleChanges = useRef(null);
  const lastDeletionToastTime = useRef(0); // Track room deletion toasts
  const lastKickedToastTime = useRef(0); // Track participant kicked toasts

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
          
          const now = Date.now();
          
          // Don't show toast to host (they initiated the deletion)
          // Prevent duplicate deletion toasts within 3 seconds
          if (!isHost && (now - lastDeletionToastTime.current) > 3000) {
            lastDeletionToastTime.current = now;
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
          
          const now = Date.now();
          
          // Don't show toast to host (they initiated the deletion)
          // Prevent duplicate deletion toasts within 3 seconds
          if (!isHost && (now - lastDeletionToastTime.current) > 3000) {
            lastDeletionToastTime.current = now;
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
        
        // Use sessionId from parent hook scope (not from localStorage to avoid stale data)
        const currentSessionId = sessionId;
        const currentIsHost = StorageUtils.isUserHost(roomId);
        
        if (currentSessionId && !currentIsHost) {
          const wasInRoom = prevParticipants[currentSessionId];
          const stillInRoom = newParticipants[currentSessionId];
          
          // If user was in room before but not anymore, and this isn't the initial load
          if (wasInRoom && !stillInRoom && Object.keys(prevParticipants).length > 0) {
            const now = Date.now();
            
            // Prevent duplicate kicked toasts within 3 seconds
            if ((now - lastKickedToastTime.current) > 3000) {
              lastKickedToastTime.current = now;
              
              // User was removed by host
              enhancedToast.error('You have been removed by the host. Redirecting to home page...');
            }
            
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
        
        // Track ALL role changes in this update cycle
        const roleChanges = {
          currentUserPromoted: false,
          currentUserDemoted: false,
          otherPromoted: null, // { id, name, role }
          otherDemoted: null   // { id, name }
        };
        
        // Check if current user's role has changed (host status)
        if (currentSessionId && newParticipants[currentSessionId]) {
          const currentUserData = newParticipants[currentSessionId];
          const newIsHost = currentUserData.isHost || false;
          const newIsParticipant = currentUserData.isParticipant !== false; // Default to true
          
          // Get current values from localStorage
          const oldIsHost = StorageUtils.isUserHost(roomId);
          const oldIsParticipant = StorageUtils.isUserParticipant(roomId);
          
          // Check if role changed
          if (newIsHost !== oldIsHost || newIsParticipant !== oldIsParticipant) {
            // Update localStorage with new role
            StorageUtils.setRoomItem('isHost', roomId, newIsHost ? 'true' : 'false');
            StorageUtils.setRoomItem('isParticipant', roomId, newIsParticipant ? 'true' : 'false');
            
            // Update isHost state to trigger UI re-render
            setIsHost(newIsHost);
            
            // Track role change for later toast notification
            if (newIsHost && !oldIsHost) {
              roleChanges.currentUserPromoted = true;
            } else if (!newIsHost && oldIsHost) {
              roleChanges.currentUserDemoted = true;
            }
          }
        }
        
        // Check if someone else got promoted to host
        if (currentSessionId && Object.keys(prevParticipants).length > 0) {
          Object.entries(newParticipants).forEach(([id, data]) => {
            if (id === currentSessionId) return; // Skip current user
            if (!prevParticipants[id]) return; // Skip new joins
            
            const wasHost = prevParticipants[id]?.isHost || false;
            const isNowHost = data.isHost || false;
            
            if (!wasHost && isNowHost) {
              // Someone got promoted
              const canVote = data.isParticipant !== false;
              roleChanges.otherPromoted = {
                id,
                name: data.name || 'Someone',
                role: canVote ? 'Host Participant' : 'Facilitator'
              };
            } else if (wasHost && !isNowHost) {
              // Someone got demoted
              roleChanges.otherDemoted = {
                id,
                name: data.name || 'Someone'
              };
            }
          });
        }
        
        // Now show the appropriate toast based on what happened
        // IMPORTANT: Show personalized toasts immediately, debounce broadcast toasts
        // Prevent duplicate toasts within 2 seconds (increased from 1 second)
        
        const now = Date.now();
        const shouldShowToast = (toastType) => {
          // Check if ANY role change toast was shown recently (within 2 seconds)
          if (now - lastRoleChangeToast.current.timestamp < 2000) {
            return false; // Skip ALL toasts within 2 seconds of any role change
          }
          lastRoleChangeToast.current = { type: toastType, timestamp: now };
          return true;
        };
        
        // Show personalized toasts immediately (no debounce for current user)
        if (roleChanges.currentUserPromoted) {
          // Current user was promoted
          const currentUserData = newParticipants[currentSessionId];
          const canVote = currentUserData?.isParticipant !== false;
          
          if (canVote && shouldShowToast('promoted-participant')) {
            enhancedToast.success('🎉 You are now a Host Participant! The room has been reset.', { duration: 8000 });
          } else if (!canVote && shouldShowToast('promoted-facilitator')) {
            enhancedToast.success('🎉 You are now a Facilitator! The room has been reset (observer mode).', { duration: 8000 });
          }
        } else if (roleChanges.currentUserDemoted) {
          // Current user was demoted (transferred their role)
          if (shouldShowToast('demoted')) {
            enhancedToast.success('✅ Role transferred successfully! The room has been reset.', { duration: 6000 });
          }
        } else if (roleChanges.otherPromoted || roleChanges.otherDemoted) {
          // For broadcast toasts (observers), use debouncing to group updates
          
          // Clear existing debounce timer
          if (roleChangeDebounceTimer.current) {
            clearTimeout(roleChangeDebounceTimer.current);
          }
          
          // Merge with pending role changes
          if (!pendingRoleChanges.current) {
            pendingRoleChanges.current = { ...roleChanges };
          } else {
            // Merge: keep track of all changes
            if (roleChanges.otherPromoted) pendingRoleChanges.current.otherPromoted = roleChanges.otherPromoted;
            if (roleChanges.otherDemoted) pendingRoleChanges.current.otherDemoted = roleChanges.otherDemoted;
          }
          
          // Debounce: wait 300ms for all updates to come through
          roleChangeDebounceTimer.current = setTimeout(() => {
            const changes = pendingRoleChanges.current;
            pendingRoleChanges.current = null;
            
            if (!changes) return;
            
            // Show broadcast toast to observers (check for duplicates)
            if (changes.otherPromoted && changes.otherDemoted) {
              // Someone else transferred role (both promotion and demotion happened)
              const toastKey = `transfer-${changes.otherPromoted.id}-${changes.otherDemoted.id}`;
              if (shouldShowToast(toastKey)) {
                enhancedToast.info(
                  `${changes.otherDemoted.name} transferred role to ${changes.otherPromoted.name} as ${changes.otherPromoted.role}. Room has been reset.`,
                  { duration: 7000 }
                );
              }
            } else if (changes.otherPromoted) {
              // Someone else got promoted (no transfer, just promotion)
              const toastKey = `other-promoted-${changes.otherPromoted.id}`;
              if (shouldShowToast(toastKey)) {
                enhancedToast.info(`${changes.otherPromoted.name} is now a ${changes.otherPromoted.role}. Room has been reset.`, { duration: 6000 });
              }
            }
          }, 300);
        }


        
        // Shallow comparison - more efficient for VDI environments
        // Check for changes in vote, name, isHost, and isParticipant
        const prevKeys = Object.keys(prevParticipants).sort();
        const newKeys = Object.keys(newParticipants).sort();
        if (prevKeys.length === newKeys.length && 
            prevKeys.every((key, i) => key === newKeys[i] && 
                          prevParticipants[key]?.vote === newParticipants[key]?.vote &&
                          prevParticipants[key]?.name === newParticipants[key]?.name &&
                          prevParticipants[key]?.isHost === newParticipants[key]?.isHost &&
                          prevParticipants[key]?.isParticipant === newParticipants[key]?.isParticipant)) {
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
        
        const now = Date.now();
        
        // Only show notification if:
        // 1. It's new and hasn't been shown yet
        // 2. The participant exists and has a valid join time
        // 3. The participant was in the room BEFORE the reset happened
        // 4. This prevents new joiners from seeing old reset notifications
        // 5. Hasn't shown a reset toast in the last 3 seconds (prevent duplicates)
        if (timestamp && 
            timestamp !== lastResetTimestamp.current && 
            !notified &&
            participantJoinTime && // Ensure participant has a join time
            participantJoinTime < timestamp && // Key fix: only show if joined before reset
            (now - lastResetToastTime.current) > 3000) { // NEW: Prevent duplicates within 3 seconds
          
          lastResetTimestamp.current = timestamp;
          lastResetToastTime.current = now; // NEW: Record when toast was shown
          
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
      
      // Clean up role change debounce timer
      if (roleChangeDebounceTimer.current) {
        clearTimeout(roleChangeDebounceTimer.current);
        roleChangeDebounceTimer.current = null;
      }
      pendingRoleChanges.current = null;
      
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
  }, [roomId, roomExists, sessionId, isHost, navigate, setParticipants, setRevealed, setCountdown, setResetState, setIsHost]);
};