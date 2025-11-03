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
   * Update story name/number
   * @param {string} roomId - The room ID
   * @param {string} story - The story name/number
   * @returns {Promise} Promise resolving when story is updated
   */
  static async updateStory(roomId, story) {
    const storyRef = FirebaseRefs.getStoryRef(roomId);
    return set(storyRef, story || '');
  }

  /**
   * Get story name/number
   * @param {string} roomId - The room ID
   * @returns {Promise<string>} Promise resolving to story name/number
   */
  static async getStory(roomId) {
    const storyRef = FirebaseRefs.getStoryRef(roomId);
    const snapshot = await get(storyRef);
    return snapshot.val() || '';
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
      
      // Reset story name/number
      const storyRef = FirebaseRefs.getStoryRef(roomId);
      await set(storyRef, '');
      
      // Reset all participant votes individually using set operations
      const resetPromises = Object.keys(roomData.participants).map(async (participantId) => {
        const voteRef = FirebaseRefs.getVoteRef(roomId, participantId);
        return set(voteRef, null);
      });
      
      // Wait for all vote resets to complete
      await Promise.all(resetPromises);
      
      // Set reset notification for participants to see
      const resetNotificationRef = FirebaseRefs.getResetNotificationRef(roomId);
      const resetTimestamp = Date.now();
      await set(resetNotificationRef, {
        timestamp: resetTimestamp,
        notified: false
      });
      
      // Auto-clear reset notification after 30 seconds to prevent it showing to late joiners
      // This ensures new participants don't see old reset notifications
      setTimeout(() => {
        // Use non-async setTimeout handler to prevent performance warnings
        // Move async operations to separate function
        this.clearResetNotificationSafely(resetNotificationRef, resetTimestamp);
      }, 30000); // 30 seconds
      
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
   * Safely clear reset notification with timestamp check (optimized for performance)
   * @param {object} resetNotificationRef - Firebase reference to reset notification
   * @param {number} resetTimestamp - The timestamp to verify before clearing
   */
  static async clearResetNotificationSafely(resetNotificationRef, resetTimestamp) {
    try {
      // Double-check the timestamp before clearing to avoid clearing newer notifications
      const currentNotification = await get(resetNotificationRef);
      if (currentNotification.exists() && 
          currentNotification.val()?.timestamp === resetTimestamp) {
        await set(resetNotificationRef, null);
      }
    } catch (error) {
      console.error('Error auto-clearing reset notification:', error);
    }
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
   * @param {string} deletedBy - Name of person who deleted the room
   * @returns {Promise} Promise resolving when room is deleted
   */
  static async deleteRoom(roomId, deletedBy = 'Host') {
    try {
      // First, get room data to have a list of participants
      const roomData = await this.getRoomData(roomId);
      
      if (roomData && roomData.participants) {
        // Update room status to signal deletion to all clients
        await this.updateRoomStatus(roomId, 'deleting');
        
        // Send email notifications before deletion (non-blocking)
        (() => {
          const sendNotifications = async () => {
            try {
              const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
              
              const deletionData = {
                roomCode: roomId,
                deletedBy,
                deletedAt: Date.now(),
                participantCount: Object.keys(roomData.participants).length,
                roomAge: roomData.createdAt ? Math.round((Date.now() - roomData.createdAt) / (1000 * 60 * 60)) : 'Unknown',
                deletionType: deletedBy.includes('System Cleanup') ? 'automatic' : 'manual',
                roomCreatedAt: roomData.createdAt || Date.now()
              };
              
              // Always notify admin
              await firestoreEmailService.notifyRoomDeleted(deletionData, 'kumarnarendiran2000@gmail.com', true);
              
              // Notify room creator if they have email notifications enabled
              if (roomData.emailNotifications?.enabled && roomData.emailNotifications?.userEmail) {
                await firestoreEmailService.notifyRoomDeleted(deletionData, roomData.emailNotifications.userEmail, false);
              }
            } catch (emailError) {
              // Email notification failed - continue with room deletion
            }
          };
          sendNotifications(); // Fire and forget
        })();
        
        // Explicitly clean up each participant to ensure they're removed
        // Firebase's real-time nature will notify clients immediately
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
        await this.deleteRoom(roomId, 'System Cleanup (Empty Room)');
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
            const reason = isFutureTimestamp ? 'System Cleanup (Invalid Timestamp)' : `System Cleanup (${hoursThreshold}h+ Inactive)`;
            await this.deleteRoom(roomId, reason);
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
    try {
      // FIRST: Get room data to fetch email configuration BEFORE adding participant
      // This ensures we have the email config even if there's timing issues
      let roomEmailConfig = null;
      try {
        const roomRef = this.getRoomRef(roomId);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
          const roomData = roomSnapshot.val();
          roomEmailConfig = roomData.emailNotifications || null;
        }
      } catch (fetchError) {
        console.error('⚠️ Warning: Could not fetch room email config before adding participant:', fetchError);
        // Continue with participant addition even if email config fetch fails
      }
      
      // SECOND: Add participant to Firebase
      const participantRef = this.getParticipantRef(roomId, participantId);
      await set(participantRef, participantData);
      
      // THIRD: Send email notifications (non-blocking but more robust)
      if (participantData.name) {
        // Use immediately invoked async function for fire-and-forget pattern
        (async () => {
          try {
            const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
            
            const notificationData = {
              roomCode: roomId,
              participantName: participantData.name,
              participantRole: 'Participant',
              joinedAt: participantData.joinedAt || Date.now()
            };
            
            console.log(`📧 Sending participant joined notifications for ${participantData.name} in room ${roomId}`);
            
            // Always notify admin
            try {
              await firestoreEmailService.notifyParticipantJoined(notificationData, 'kumarnarendiran2000@gmail.com', true);
              console.log('✅ Admin notification sent successfully');
            } catch (adminEmailError) {
              console.error('❌ Failed to send admin notification:', adminEmailError);
            }
            
            // Notify room creator if email notifications are enabled
            if (roomEmailConfig?.enabled && roomEmailConfig?.userEmail) {
              try {
                await firestoreEmailService.notifyParticipantJoined(notificationData, roomEmailConfig.userEmail, false);
                console.log(`✅ User notification sent to ${roomEmailConfig.userEmail}`);
              } catch (userEmailError) {
                console.error('❌ Failed to send user notification:', userEmailError);
              }
            } else {
              console.log('ℹ️ User email notifications not enabled or no email configured');
            }
          } catch (emailError) {
            console.error('❌ Email notification process failed:', emailError);
          }
        })(); // Immediately invoke but don't await (fire-and-forget)
      } else {
        console.warn('⚠️ No participant name provided, skipping email notifications');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }
  
  /**
   * Add a participant to a room WITHOUT sending email notifications
   * Used for fast joins where email will be sent later
   * 
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @param {Object} participantData - The participant data
   * @returns {Promise} Promise resolving when participant is added
   */
  static async addParticipantWithoutEmail(roomId, participantId, participantData) {
    try {
      const participantRef = this.getParticipantRef(roomId, participantId);
      await set(participantRef, participantData);
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }
  
  /**
   * Send participant joined email notification (decoupled from join logic)
   * 
   * @param {string} roomId - The room ID
   * @param {Object} participantData - The participant data
   * @returns {Promise} Promise resolving when emails are sent
   */
  static async sendParticipantJoinedEmail(roomId, participantData) {
    try {
      // Get room email configuration
      const roomRef = this.getRoomRef(roomId);
      const roomSnapshot = await get(roomRef);
      let roomEmailConfig = null;
      
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        roomEmailConfig = roomData.emailNotifications || null;
      }
      
      const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
      
      const notificationData = {
        roomCode: roomId,
        participantName: participantData.name,
        participantRole: 'Participant',
        joinedAt: participantData.joinedAt || Date.now()
      };
      
      console.log(`📧 Sending participant joined notifications for ${participantData.name} in room ${roomId}`);
      
      // Always notify admin
      try {
        await firestoreEmailService.notifyParticipantJoined(notificationData, 'kumarnarendiran2000@gmail.com', true);
        console.log('✅ Admin notification sent successfully');
      } catch (adminEmailError) {
        console.error('❌ Failed to send admin notification:', adminEmailError);
      }
      
      // Notify room creator if email notifications are enabled
      if (roomEmailConfig?.enabled && roomEmailConfig?.userEmail) {
        try {
          await firestoreEmailService.notifyParticipantJoined(notificationData, roomEmailConfig.userEmail, false);
          console.log(`✅ User notification sent to ${roomEmailConfig.userEmail}`);
        } catch (userEmailError) {
          console.error('❌ Failed to send user notification:', userEmailError);
        }
      } else {
        console.log('ℹ️ User email notifications not enabled or no email configured');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Email notification process failed:', error);
      throw error;
    }
  }
  
  /**
   * Remove a participant from a room
   * 
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @param {string} participantName - Name of participant being removed (for email)
   * @param {string} reason - Reason for removal ('kicked', 'left', 'disconnected')
   * @returns {Promise} Promise resolving when participant is removed
   */
  static async removeParticipant(roomId, participantId, participantName = null, reason = 'left') {
    try {
      // Remove from Firebase first
      const participantRef = this.getParticipantRef(roomId, participantId);
      await remove(participantRef);
      
      // Send email notifications if we have participant info (non-blocking)
      if (participantName) {
        (() => {
          const sendNotifications = async () => {
            try {
              const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
              
              const participantData = {
                roomCode: roomId,
                participantName,
                leftAt: Date.now(),
                reason
              };
              
              // Always notify admin
              await firestoreEmailService.notifyParticipantLeft(participantData, 'kumarnarendiran2000@gmail.com', true);
              
              // Get room data to check for user email notifications
              const roomRef = this.getRoomRef(roomId);
              const roomSnapshot = await get(roomRef);
              if (roomSnapshot.exists()) {
                const roomData = roomSnapshot.val();
                if (roomData.emailNotifications?.enabled && roomData.emailNotifications?.userEmail) {
                  await firestoreEmailService.notifyParticipantLeft(participantData, roomData.emailNotifications.userEmail, false);
                }
              }
            } catch (emailError) {
              // Email notification failed - continue with participant removal
            }
          };
          sendNotifications(); // Fire and forget
        })();
      }
      
      return true;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Host kicks a participant from a room
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID to kick
   * @param {string} hostName - The name of the host
   * @param {string} participantName - The name of the participant being kicked
   * @returns {Promise} Promise resolving when participant is kicked
   */
  static async kickParticipant(roomId, participantId, hostName, participantName = null) {
    try {
      // Get participant name if not provided
      if (!participantName) {
        const roomData = await this.getRoomData(roomId);
        participantName = roomData?.participants?.[participantId]?.name || 'Unknown Participant';
      }
      
      // First mark the participant as kicked
      const kickedRef = FirebaseRefs.getKickedRef(roomId, participantId);
      await set(kickedRef, {
        timestamp: Date.now(),
        by: hostName
      });
      
      // Give a small delay for the kicked status to be processed by the client
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then remove the participant with email notification
      return this.removeParticipant(roomId, participantId, participantName, 'kicked');
    } catch (error) {
      console.error('Error kicking participant:', error);
      throw error;
    }
  }

  /**
   * Update a participant's role (host status and voting participation)
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID to update
   * @param {Object} roleUpdate - Role update data
   * @param {boolean} roleUpdate.isHost - Whether the participant should be a host
   * @param {boolean} roleUpdate.isParticipant - Whether the participant votes
   * @param {string} changedBy - Name of the person making the change
   * @returns {Promise} Promise resolving when role is updated
   */
  static async updateParticipantRole(roomId, participantId, roleUpdate, changedBy = 'Host') {
    try {
      const participantRef = this.getParticipantRef(roomId, participantId);
      const snapshot = await get(participantRef);
      
      if (!snapshot.exists()) {
        throw new Error('Participant not found');
      }
      
      const currentData = snapshot.val();
      const updatedData = {
        ...currentData,
        isHost: roleUpdate.isHost ?? currentData.isHost ?? false,
        isParticipant: roleUpdate.isParticipant ?? currentData.isParticipant ?? true,
        roleUpdatedAt: Date.now(),
        roleUpdatedBy: changedBy
      };
      
      await set(participantRef, updatedData);
      
      // Send email notification for role change (non-blocking)
      (() => {
        const sendNotifications = async () => {
          try {
            const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
            
            const roleChangeData = {
              roomCode: roomId,
              participantName: currentData.name,
              newRole: roleUpdate.isHost 
                ? (roleUpdate.isParticipant ? 'Host & Participant' : 'Host (Facilitator)')
                : 'Participant',
              changedBy,
              changedAt: Date.now()
            };
            
            // Always notify admin
            await firestoreEmailService.notifyRoleChanged(roleChangeData, 'kumarnarendiran2000@gmail.com', true);
            
            // Get room data to check for user email notifications
            const roomRef = this.getRoomRef(roomId);
            const roomSnapshot = await get(roomRef);
            if (roomSnapshot.exists()) {
              const roomData = roomSnapshot.val();
              if (roomData.emailNotifications?.enabled && roomData.emailNotifications?.userEmail) {
                await firestoreEmailService.notifyRoleChanged(roleChangeData, roomData.emailNotifications.userEmail, false);
              }
            }
          } catch (emailError) {
            // Email notification failed - continue with role update
          }
        };
        sendNotifications(); // Fire and forget
      })();
      
      return true;
    } catch (error) {
      console.error('Error updating participant role:', error);
      throw error;
    }
  }

  /**
   * Promote a participant to host
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID to promote
   * @param {boolean} canVote - Whether the new host can vote (true = Host & Participant, false = Facilitator)
   * @param {string} promotedBy - Name of the person promoting
   * @returns {Promise} Promise resolving when participant is promoted
   */
  static async promoteToHost(roomId, participantId, canVote = true, promotedBy = 'Host') {
    // Update the participant role
    await this.updateParticipantRole(
      roomId, 
      participantId, 
      { isHost: true, isParticipant: canVote },
      promotedBy
    );
    
    // Reset the entire room (clear all votes, reset revealed state, clear story)
    await this.resetVotes(roomId);
    
    return true;
  }

  /**
   * Demote a host to regular participant
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID to demote
   * @param {string} demotedBy - Name of the person demoting
   * @returns {Promise} Promise resolving when host is demoted
   */
  static async demoteFromHost(roomId, participantId, demotedBy = 'Host') {
    // Update the participant role
    await this.updateParticipantRole(
      roomId, 
      participantId, 
      { isHost: false, isParticipant: true },
      demotedBy
    );
    
    // Reset the entire room (clear all votes, reset revealed state, clear story)
    await this.resetVotes(roomId);
    
    return true;
  }

  /**
   * Toggle a participant's voting status
   * @param {string} roomId - The room ID
   * @param {string} participantId - The participant ID
   * @param {boolean} canVote - Whether the participant can vote
   * @param {string} changedBy - Name of the person making the change
   * @returns {Promise} Promise resolving when voting status is updated
   */
  static async toggleVotingStatus(roomId, participantId, canVote, changedBy = 'Host') {
    const participantRef = this.getParticipantRef(roomId, participantId);
    const snapshot = await get(participantRef);
    
    if (!snapshot.exists()) {
      throw new Error('Participant not found');
    }
    
    const currentData = snapshot.val();
    return this.updateParticipantRole(
      roomId,
      participantId,
      { isHost: currentData.isHost ?? false, isParticipant: canVote },
      changedBy
    );
  }
}

export default RoomService;