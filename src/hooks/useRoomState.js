import { useState } from 'react';
import * as StorageUtils from '../utils/localStorage';

/**
 * Hook for managing room state
 * Handles all room-related state variables
 */
export const useRoomState = (roomId) => {
  const [loading, setLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(false);
  const [participants, setParticipants] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [resetState, setResetState] = useState(null);
  
  // Get user data from storage
  const userName = StorageUtils.getUserName(roomId);
  const sessionId = StorageUtils.getSessionId(roomId);
  const isHost = StorageUtils.isUserHost(roomId);

  return {
    // State values
    loading,
    roomExists,
    participants,
    revealed,
    showNameModal,
    countdown,
    resetState,
    userName,
    sessionId,
    isHost,
    
    // State setters
    setLoading,
    setRoomExists,
    setParticipants,
    setRevealed,
    setShowNameModal,
    setCountdown,
    setResetState
  };
};