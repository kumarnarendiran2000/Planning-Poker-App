import { useEffect, useRef } from 'react';
import RoomService from '../services/roomService';
import * as StorageUtils from '../utils/localStorage';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for initializing and checking room existence
 * Handles room existence validation and initial setup
 */
export const useRoomInitialization = (roomId, state, navigation, alertFunctions) => {
  const { setLoading, setRoomExists, setShowNameModal } = state;
  const { navigate } = navigation;
  const { showError } = alertFunctions;
  
  // Use useRef to track if room has been checked to prevent multiple executions
  const hasCheckedRoom = useRef(false);
  const toastShown = useRef(false);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        if (hasCheckedRoom.current) return; // Prevent duplicate checks
        hasCheckedRoom.current = true;
        
        // Check if room exists
        const exists = await RoomService.checkRoomExists(roomId);
        
        if (!exists) {
          setLoading(false); // Make sure to stop loading
          setRoomExists(false); // Explicitly set room as not existing
          handleRoomNotFound();
          return;
        }
        
        // Room exists and is accessible
        setRoomExists(true);
        const storedSessionId = StorageUtils.getSessionId(roomId);
        const storedUserName = StorageUtils.getUserName(roomId);
        
        // Direct URL access - show name modal
        if (!storedSessionId || !storedUserName) {
          setLoading(false);
          setShowNameModal(true);
          return; 
        }
        
        // Mark as initialized - subscription will be handled by useRoomSubscription
        setLoading(false);
      } catch (error) {
        console.error('Error setting up room:', error);
        setLoading(false);
        showError({
          title: 'Error',
          message: `Failed to load room: ${error.message}`,
          okText: 'Go to Home',
          onOk: () => navigate('/', { replace: true })
        });
      }
    };
    
    /**
     * Handle case when room does not exist (never existed - not deleted)
     */
    const handleRoomNotFound = () => {
      const deletedRoomId = StorageUtils.getRoomItem('deletingRoom', roomId);
      
      // Clear only this room's data
      StorageUtils.clearRoomData(roomId);
      
      // For direct URL access to non-existent rooms, deletedRoomId will be null
      if (!deletedRoomId) {
        // This is a truly non-existent room (never existed)
        // Show the error page with timer redirect
        setRoomExists(false); // This will trigger the error page in Room component
        
        // Only show toast once
        if (!toastShown.current) {
          toastShown.current = true;
          enhancedToast.error(`Room "${roomId}" does not exist. Redirecting to home page...`);
        }
        
        // Fallback: Navigate to home after 3 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      } else {
        // User deleted it themselves, just navigate
        navigate('/', { replace: true });
      }
    };
    
    initializeRoom();
  }, [roomId]); // Removed other dependencies to prevent re-execution
};