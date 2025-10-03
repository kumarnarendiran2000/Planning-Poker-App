import { useCallback } from 'react';
import RoomService from '../services/roomService';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Hook for managing story operations (update, validation)
 * Handles story name/number updates for the room
 */
export const useStoryOperations = (roomId, isHost) => {
  /**
   * Update the story name/number for the room
   * @param {string} storyName - The new story name/number
   * @returns {Promise} Promise resolving when story is updated
   */
  const updateStory = useCallback(async (storyName) => {
    if (!isHost) {
      enhancedToast.error('Only the host can update the story');
      throw new Error('Only the host can update the story');
    }

    try {
      await RoomService.updateStory(roomId, storyName);
      // Let the component handle success toasts for better UX control
    } catch (error) {
      console.error('Error updating story:', error);
      enhancedToast.error('Failed to update story: ' + error.message);
      throw error;
    }
  }, [roomId, isHost]);

  return {
    updateStory
  };
};