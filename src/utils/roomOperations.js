/**
 * Room creation utilities
 * Helper functions for creating and managing rooms
 */

import { ref, set, get } from 'firebase/database';
import { db } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';
import * as StorageUtils from './localStorage';

/**
 * Generate a random room code
 * @returns {string} 6-character uppercase room code
 */
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generate a session ID for a user
 * @returns {string} 8-character session ID
 */
export const generateSessionId = () => {
  return uuidv4().substring(0, 8);
};

/**
 * Create room data structure
 * @param {string} roomCode - Room code
 * @param {string} hostSessionId - Host session ID
 * @param {string} hostName - Host name
 * @param {boolean} hostParticipates - Whether host participates in voting
 * @returns {Object} Room data object
 */
export const createRoomData = (roomCode, hostSessionId, hostName, hostParticipates = true) => {
  return {
    roomCode,
    status: 'waiting',
    story: '',
    participants: {
      [hostSessionId]: {
        name: hostName.trim(),
        isHost: true,
        isParticipant: hostParticipates,
        vote: null,
        joinedAt: Date.now()
      }
    },
    createdAt: Date.now(),
    lastActive: Date.now()
  };
};

/**
 * Create participant data structure
 * @param {string} name - Participant name
 * @param {boolean} isHost - Whether the participant is the host
 * @param {boolean} isParticipant - Whether the user participates in voting
 * @returns {Object} Participant data object
 */
export const createParticipantData = (name, isHost = false, isParticipant = true) => {
  return {
    name: name.trim(),
    vote: null,
    joinedAt: Date.now(),
    isParticipant,
    ...(isHost && { isHost: true })
  };
};

/**
 * Create a new room in Firebase
 * @param {string} hostName - Name of the host
 * @param {boolean} hostParticipates - Whether the host participates in voting
 * @param {Object} emailConfig - Email notification configuration
 * @returns {Promise<Object>} Promise resolving to { roomCode, sessionId }
 */
export const createRoom = async (hostName, hostParticipates = true, emailConfig = null) => {
  const roomCode = generateRoomCode();
  const hostSessionId = generateSessionId();
  
  // Create room data
  const roomData = createRoomData(roomCode, hostSessionId, hostName, hostParticipates);
  
  // Add email configuration to room data if provided
  if (emailConfig?.enabled) {
    roomData.emailNotifications = {
      enabled: true,
      userEmail: emailConfig.userEmail || null,
      notifyParticipantJoins: true,
      notifyParticipantLeaves: true,
      notifyRoomDeletion: true
    };
  }
  
  // Save room to Firebase
  await set(ref(db, `rooms/${roomCode}`), roomData);
  
  // Add host as participant
  const participantData = createParticipantData(hostName, true, hostParticipates);
  await set(ref(db, `rooms/${roomCode}/participants/${hostSessionId}`), participantData);
  
  // Save session data
  StorageUtils.saveUserSession({
    roomId: roomCode,
    sessionId: hostSessionId,
    userName: hostName.trim(),
    isHost: true,
    isParticipant: hostParticipates
  });
  
  // Send email notifications for room creation (non-blocking for better performance)
  (() => {
    const sendNotifications = async () => {
      try {
        const emailData = {
          roomCode,
          hostName: hostName.trim(),
          hostRole: hostParticipates ? 'Host & Participant' : 'Facilitator Only',
          createdAt: Date.now()
        };
        
        // Always notify admin (with admin-specific content)
        const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
        await firestoreEmailService.notifyRoomCreated(emailData, 'kumarnarendiran2000@gmail.com', true);
        
        // Notify user if they opted in (with user-friendly content)
        if (emailConfig?.enabled && emailConfig?.userEmail) {
          const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
          await firestoreEmailService.notifyRoomCreated(emailData, emailConfig.userEmail, false);
        }
      } catch (error) {
        // Email notification failed - continue with room creation
      }
    };
    sendNotifications(); // Fire and forget
  })();
  
  return { roomCode, sessionId: hostSessionId };
};

/**
 * Join an existing room
 * @param {string} roomCode - Room code to join
 * @param {string} name - Participant name
 * @returns {Promise<string>} Promise resolving to session ID
 */
export const joinRoom = async (roomCode, name) => {
  const sessionId = generateSessionId();
  
  // Create participant data (joiners are always participants)
  const participantData = createParticipantData(name, false, true);
  
  // Add participant to room
  await set(ref(db, `rooms/${roomCode}/participants/${sessionId}`), participantData);
  
  // Save session data
  StorageUtils.saveUserSession({
    roomId: roomCode,
    sessionId: sessionId,
    userName: name.trim(),
    isHost: false,
    isParticipant: true
  });
  
  // Send email notifications for participant joining (non-blocking for better performance)
  (() => {
    const sendNotifications = async () => {
      try {
        const participantData = {
          roomCode,
          participantName: name.trim(),
          joinedAt: Date.now()
        };
        
        // Always notify admin (with admin-specific content)
        const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
        await firestoreEmailService.notifyParticipantJoined(participantData, 'kumarnarendiran2000@gmail.com', true);
        
        // Use Firebase's real-time database consistency - no artificial delays needed
        
        // Get room data to check for user email notifications
        const roomRef = ref(db, `rooms/${roomCode}`);
        const roomSnapshot = await get(roomRef);
        
        if (roomSnapshot.exists()) {
          const roomData = roomSnapshot.val();
          
          if (roomData.emailNotifications?.enabled && roomData.emailNotifications?.userEmail) {
            const firestoreEmailService = (await import('../services/firestoreEmailService.js')).default;
            await firestoreEmailService.notifyParticipantJoined(participantData, roomData.emailNotifications.userEmail, false);
          }
        }
      } catch (error) {
        // Email notification failed - continue with participant join
      }
    };
    sendNotifications(); // Fire and forget
  })();
  
  return sessionId;
};