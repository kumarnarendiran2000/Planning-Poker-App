import { useNavigate } from 'react-router-dom';
import { useAlertModal } from '../components/modals/AlertModal';
import { useRoomState } from './useRoomState';
import { useRoomInitialization } from './useRoomInitialization';
import { useRoomSubscription } from './useRoomSubscription';
import { useRoomOperations } from './useRoomOperations';

/**
 * Custom hook for managing room state and operations
 * Refactored into smaller focused hooks for better maintainability
 * 
 * @param {string} roomId - The room ID
 * @param {Object} alertFunctions - Alert modal functions { showError, showConfirm, showSuccess }
 * @returns {Object} Room state and operations
 */
const useRoom = (roomId, alertFunctions = {}) => {
  const navigate = useNavigate();
  
  // Get alert modal functions - use passed functions or create default ones
  const { showError, showConfirm, showSuccess } = alertFunctions.showError 
    ? alertFunctions 
    : useAlertModal();

  // Room state management
  const state = useRoomState(roomId);
  
  // Navigation wrapper
  const navigation = { navigate };
  
  // Alert functions wrapper
  const alerts = { showError, showConfirm, showSuccess };
  
  // Initialize room and check existence
  useRoomInitialization(roomId, state, navigation, alerts);
  
  // Handle real-time subscriptions
  useRoomSubscription(roomId, state, navigation);
  
  // Room operations (join, delete)
  const { joinRoom, deleteRoom } = useRoomOperations(roomId, state, navigation, alerts);

  return {
    loading: state.loading,
    roomExists: state.roomExists,
    participants: state.participants,
    revealed: state.revealed,
    countdown: state.countdown,
    resetState: state.resetState,
    showNameModal: state.showNameModal,
    setShowNameModal: state.setShowNameModal,
    userName: state.userName,
    sessionId: state.sessionId,
    isHost: state.isHost,
    joinRoom,
    deleteRoom
  };
};

export default useRoom;