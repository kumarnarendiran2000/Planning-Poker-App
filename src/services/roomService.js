import { onValue, set, remove, update, get } from 'firebase/database';
import { db } from '../firebase/config';
import { FIREBASE_PATHS } from '../utils/constants';
import * as FirebaseRefs from './firebaseReferences';
import * as RoomValidation from './roomValidation';

/**
 * Firebase service for room operations
 * Refactored to use utility modules for better organization
 */
class RoomService {
  /**
   * Get a reference to a room in Firebase
   * @param {string} roomId - The room ID
   * @returns {Object} Firebase reference
   */
  static getRoomRef(roomId) {
    return FirebaseRefs.getRoomRef(roomId);
  }

  /**
   * Get a reference to a participant in Firebase
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @returns {Object} Firebase reference
   */
  static getParticipantRef(roomId, participantId) {
    return FirebaseRefs.getParticipantRef(roomId, participantId);
  }

  /**
   * Check if a room exists and is accessible
   * @param {string} roomId - The room ID
   * @returns {Promise<boolean>} Promise resolving to true if room exists and is not being deleted
   */
  static async checkRoomExists(roomId) {
    return RoomValidation.checkRoomExists(roomId);
  }

  /**
   * Get room data
   * @param {string} roomId - The room ID
   * @returns {Promise<Object|null>} Promise resolving to room data or null if not found
   */
  static async getRoomData(roomId) {
    return RoomValidation.getRoomData(roomId);
  }

  /**
   * Subscribe to room updates
   * @param {string} roomId - The room ID
   * @param {function} callback - Callback function to handle updates
   * @returns {function} Unsubscribe function
   */
  static subscribeToRoom(roomId, callback) {
    const roomRef = this.getRoomRef(roomId);
    return onValue(roomRef, callback);
  }
  
  /**
   * Clean up orphaned participants (those who are inactive)
   * This function is intentionally empty now as we're simplifying our approach.
   * We'll keep all participants in the room regardless of activity status.
   * 
   * @param {string} roomId - The room ID
   * @param {Object} participants - The current participants object
   * @returns {Promise} Promise resolving when cleanup is complete
   */
  static async cleanupOrphanedParticipants(roomId, participants) {
    // Intentionally empty - we're not automatically removing participants anymore
    // This helps avoid race conditions and participants unexpectedly disappearing
    return Promise.resolve();
  }

  /**
   * Submit a vote
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @param {string} value - The vote value
   * @returns {Promise} Promise resolving when vote is submitted
   */
  static async submitVote(roomId, participantId, value) {
    const voteRef = FirebaseRefs.getVoteRef(roomId, participantId);
    return set(voteRef, value);
  }

  /**
   * Skip voting for a participant
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @returns {Promise} Promise resolving when skip is submitted
   */
  static async skipVote(roomId, participantId) {
    const voteRef = FirebaseRefs.getVoteRef(roomId, participantId);
    return set(voteRef, 'SKIP');
  }

  /**
   * Unskip a vote (remove skip status to allow voting again)
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @returns {Promise} Promise resolving when unskip is completed
   */
  static async unskipVote(roomId, participantId) {
    const voteRef = FirebaseRefs.getVoteRef(roomId, participantId);
    return set(voteRef, null);
  }

  /**
   * Reveal votes
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when votes are revealed
   */
  static async revealVotes(roomId) {
    const revealedRef = FirebaseRefs.getRevealedRef(roomId);
    return set(revealedRef, true);
  }

  /**
   * Start reveal countdown
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when countdown is started
   */
  static async startRevealCountdown(roomId) {
    const countdownRef = FirebaseRefs.getCountdownRef(roomId);
    return set(countdownRef, {
      active: true,
      startTime: Date.now()
    });
  }

  /**
   * Stop reveal countdown
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when countdown is stopped
   */
  static async stopRevealCountdown(roomId) {
    const countdownRef = FirebaseRefs.getCountdownRef(roomId);
    return set(countdownRef, null);
  }

  /**
   * Start reset state to show loading for all participants
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when reset state is set
   */
  static async startResetState(roomId) {
    try {
      const resetStateRef = FirebaseRefs.getResetStateRef(roomId);
      await set(resetStateRef, {
        active: true,
        startTime: Date.now()
      });
    } catch (error) {
      console.error('Error starting reset state:', error);
      throw error;
    }
  }

  /**
   * Stop reset state
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when reset state is cleared
   */
  static async stopResetState(roomId) {
    try {
      const resetStateRef = FirebaseRefs.getResetStateRef(roomId);
      await set(resetStateRef, null);
    } catch (error) {
      console.error('Error stopping reset state:', error);
      throw error;
    }
  }

  /**
   * Reset votes
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when votes are reset
   */
  static async resetVotes(roomId) {
    try {
      // Get current room data first to see participants
      const roomData = await this.getRoomData(roomId);
      if (!roomData || !roomData.participants) {
        throw new Error('Room data not found');
      }

      // Reset revealed status first
      const revealedRef = FirebaseRefs.getRevealedRef(roomId);
      await set(revealedRef, false);
      
      // Reset all participant votes individually using set operations
      const resetPromises = Object.keys(roomData.participants).map(async (participantId) => {
        const voteRef = FirebaseRefs.getVoteRef(roomId, participantId);
        return set(voteRef, null);
      });
      
      // Wait for all vote resets to complete
      await Promise.all(resetPromises);
      
      // Set reset notification for participants to see
      const resetNotificationRef = FirebaseRefs.getResetNotificationRef(roomId);
      await set(resetNotificationRef, {
        timestamp: Date.now(),
        notified: false
      });
      
      return true;
    } catch (error) {
      console.error('Error in resetVotes:', error);
      throw error;
    }
  }

  /**
   * Clear reset notification
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when notification is cleared
   */
  static async clearResetNotification(roomId) {
    const resetNotificationRef = FirebaseRefs.getResetNotificationRef(roomId);
    return set(resetNotificationRef, null);
  }

  /**
   * Update room status
   * @param {string} roomId - The room ID
   * @param {string} status - The status to set (e.g., 'deleting')
   * @returns {Promise} Promise resolving when status is updated
   */
  static async updateRoomStatus(roomId, status) {
    const statusRef = FirebaseRefs.getStatusRef(roomId);
    return set(statusRef, status);
  }

  /**
   * Delete a room
   * 
   * @param {string} roomId - The room ID
   * @returns {Promise} Promise resolving when room is deleted
   */
  static async deleteRoom(roomId) {
    try {
      // First, get room data to have a list of participants
      const roomData = await this.getRoomData(roomId);
      
      if (roomData && roomData.participants) {
        // Update room status to signal deletion to all clients
        await this.updateRoomStatus(roomId, 'deleting');
        
        // Give clients time to receive the status update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Explicitly clean up each participant to ensure they're removed
        const participantPromises = Object.keys(roomData.participants).map(participantId => {
          const participantRef = this.getParticipantRef(roomId, participantId);
          return remove(participantRef);
        });
        
        // Wait for all participant deletions to complete
        await Promise.all(participantPromises);
      }
      
      // Finally remove the entire room
      const roomRef = this.getRoomRef(roomId);
      return await remove(roomRef);
    } catch (error) {
      console.error('Error in room deletion:', error);
      throw error;
    }
  }
  
  /**
   * Check if a room is empty (has no participants)
   * @param {string} roomId - The room ID
   * @returns {Promise<boolean>} Promise resolving to true if room is empty
   */
  static async isRoomEmpty(roomId) {
    return RoomValidation.isRoomEmpty(roomId);
  }
  
  /**
   * Delete a room if it's empty
   * @param {string} roomId - The room ID
   * @returns {Promise<boolean>} Promise resolving to true if room was deleted
   */
  static async deleteRoomIfEmpty(roomId) {
    try {
      const isEmpty = await this.isRoomEmpty(roomId);
      
      if (isEmpty) {
        // Room is empty, delete it
        await this.deleteRoom(roomId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in deleteRoomIfEmpty:', error);
      throw error;
    }
  }

  /**
   * Clean up old rooms (older than 4 hours)
   * @returns {Promise} Promise resolving when cleanup is complete
   */
  static async cleanupOldRooms() {
    return this.cleanupOldRoomsWithThreshold(4);
  }

  /**
   * Clean up old rooms with custom threshold (for testing)
   * @param {number} hoursThreshold - Hours threshold for deletion
   * @returns {Promise} Promise resolving when cleanup is complete
   */
  static async cleanupOldRoomsWithThreshold(hoursThreshold = 6) {
    try {
      const roomsRef = FirebaseRefs.getRoomsRef();
      const snapshot = await get(roomsRef);
      
      if (!snapshot.exists()) {
        return { deletedCount: 0, message: 'No rooms found' };
      }
      
      const rooms = snapshot.val();
      const now = Date.now();
      const thresholdTime = now - (hoursThreshold * 60 * 60 * 1000);
      const deletedRooms = [];
      
      // Check each room's creation time
      for (const [roomId, roomData] of Object.entries(rooms)) {
        // Check for invalid future timestamps (system clock issues)
        const isFutureTimestamp = roomData.createdAt > now;
        const isOldRoom = roomData.createdAt && roomData.createdAt < thresholdTime;
        
        // Delete room if it's old OR has invalid future timestamp
        if ((roomData.createdAt && isOldRoom) || isFutureTimestamp) {
          try {
            const reason = isFutureTimestamp ? 'invalid timestamp' : `>${hoursThreshold}h old`;
            await this.deleteRoom(roomId);
            deletedRooms.push(roomId);
          } catch (error) {
            console.error(`❌ Failed to delete room ${roomId}:`, error);
          }
        }
      }
      
      return { 
        deletedCount: deletedRooms.length, 
        deletedRooms, 
        message: `Cleaned up ${deletedRooms.length} old rooms (threshold: ${hoursThreshold}h)` 
      };
    } catch (error) {
      console.error('Error in cleanupOldRooms:', error);
      throw error;
    }
  }

  /**
   * Add a participant to a room
   * 
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @param {Object} participantData - The participant data
   * @returns {Promise} Promise resolving when participant is added
   */
  static async addParticipant(roomId, participantId, participantData) {
    const participantRef = this.getParticipantRef(roomId, participantId);
    return set(participantRef, participantData);
  }
  
  /**
   * Remove a participant from a room
   * 
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @returns {Promise} Promise resolving when participant is removed
   */
  static async removeParticipant(roomId, participantId) {
    const participantRef = this.getParticipantRef(roomId, participantId);
    return remove(participantRef);
  }

  /**
   * Host kicks a participant from a room
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID to kick
   * @param {string} hostName - The name of the host
   * @returns {Promise} Promise resolving when participant is kicked
   */
  static async kickParticipant(roomId, participantId, hostName) {
    try {
      // First mark the participant as kicked
      const kickedRef = FirebaseRefs.getKickedRef(roomId, participantId);
      await set(kickedRef, {
        timestamp: Date.now(),
        by: hostName
      });
      
      // Give a small delay for the kicked status to be processed by the client
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then remove the participant
      return this.removeParticipant(roomId, participantId);
    } catch (error) {
      console.error('Error kicking participant:', error);
      throw error;
    }
  }
}

export default RoomService;