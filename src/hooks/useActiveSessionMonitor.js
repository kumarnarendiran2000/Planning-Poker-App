import { useEffect, useRef } from 'react';
import RoomService from '../services/roomService';
import * as StorageUtils from '../utils/localStorage';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for monitoring active sessions for room deletions
 * Handles detection when rooms are deleted while user is on homepage
 */
export const useActiveSessionMonitor = () => {
  const activeSubscriptions = useRef(new Map());
  const isMonitoringActive = useRef(false);

  useEffect(() => {
    const startMonitoring = () => {
      if (isMonitoringActive.current) return;
      isMonitoringActive.current = true;

      const activeSessions = StorageUtils.getActiveSessions();
      
      // Subscribe to each active session
      activeSessions.forEach(session => {
        if (!activeSubscriptions.current.has(session.roomId)) {
          const unsubscribe = RoomService.subscribeToRoom(session.roomId, (snapshot) => {
            handleRoomUpdate(session.roomId, snapshot, session);
          });
          
          activeSubscriptions.current.set(session.roomId, unsubscribe);
        }
      });

      // Clean up subscriptions for sessions that no longer exist in localStorage
      const currentRoomIds = new Set(activeSessions.map(s => s.roomId));
      for (const [roomId, unsubscribe] of activeSubscriptions.current.entries()) {
        if (!currentRoomIds.has(roomId)) {
          unsubscribe();
          activeSubscriptions.current.delete(roomId);
        }
      }
    };

    const stopMonitoring = () => {
      // Unsubscribe from all room updates
      for (const [roomId, unsubscribe] of activeSubscriptions.current.entries()) {
        unsubscribe();
      }
      activeSubscriptions.current.clear();
      isMonitoringActive.current = false;
    };

    const handleRoomUpdate = (roomId, snapshot, session) => {
      if (!snapshot.exists()) {
        // Room was deleted from database
        handleRoomDeleted(roomId, session);
        return;
      }

      const roomData = snapshot.val();
      
      // Check if room is marked as deleting
      if (roomData.status === 'deleting') {
        // Check if the current user is deleting the room
        const deletedRoomId = StorageUtils.getRoomItem('deletingRoom', roomId);
        if (deletedRoomId !== roomId) {
          // Room is being deleted by someone else (host)
          handleRoomDeleted(roomId, session);
        }
      }
    };

    const handleRoomDeleted = (roomId, session) => {
      // Check if the current user deleted the room themselves
      const deletedRoomId = StorageUtils.getRoomItem('deletingRoom', roomId);
      if (deletedRoomId !== roomId) {
        // Clear room data immediately
        StorageUtils.clearRoomData(roomId);
        
        // Don't show toast to host (they initiated the deletion)
        if (!session.isHost) {
          // Show appropriate toast message for homepage context
          enhancedToast.error(`Room "${roomId}" has been cleaned up and deleted as it's old. Contact host for latest room if trying to join.`);
        }
        
        // Trigger sessions refresh by dispatching custom event
        window.dispatchEvent(new CustomEvent('pokersessionschanged'));
      }
      
      // Remove subscription for this room
      const unsubscribe = activeSubscriptions.current.get(roomId);
      if (unsubscribe) {
        unsubscribe();
        activeSubscriptions.current.delete(roomId);
      }
    };

    // Listen for changes in active sessions
    const handleSessionsChange = () => {
      startMonitoring(); // This will add/remove subscriptions as needed
    };

    // Listen for storage events (when localStorage changes in other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('poker_')) {
        startMonitoring();
      }
    };

    // Start initial monitoring
    startMonitoring();

    // Listen for session changes
    window.addEventListener('pokersessionschanged', handleSessionsChange);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      stopMonitoring();
      window.removeEventListener('pokersessionschanged', handleSessionsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This hook doesn't return anything, it just monitors
};