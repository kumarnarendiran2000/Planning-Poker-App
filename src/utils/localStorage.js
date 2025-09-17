/**
 * Utility functions for handling localStorage operations in the Planning Poker app
 */

const PREFIX = 'poker_';

/**
 * Get a room-specific value from localStorage
 * 
 * @param {string} key - The key to retrieve
 * @param {string} roomId - The room ID for room-specific storage
 * @returns {string|null} The stored value or null if not found
 */
export const getRoomItem = (key, roomId) => {
  return localStorage.getItem(`${PREFIX}${key}_${roomId}`);
};

/**
 * Set a room-specific value in localStorage
 * 
 * @param {string} key - The key to set
 * @param {string} roomId - The room ID for room-specific storage
 * @param {string} value - The value to store
 */
export const setRoomItem = (key, roomId, value) => {
  localStorage.setItem(`${PREFIX}${key}_${roomId}`, value);
};

/**
 * Remove a room-specific value from localStorage
 * 
 * @param {string} key - The key to remove
 * @param {string} roomId - The room ID for room-specific storage
 */
export const removeRoomItem = (key, roomId) => {
  localStorage.removeItem(`${PREFIX}${key}_${roomId}`);
};

/**
 * Clear all room-specific data for a given room
 * 
 * @param {string} roomId - The room ID to clear data for
 */
export const clearRoomData = (roomId) => {
  removeRoomItem('userName', roomId);
  removeRoomItem('sessionId', roomId);
  removeRoomItem('isHost', roomId);
  removeRoomItem('isParticipant', roomId);
  removeRoomItem('deletingRoom', roomId);
  removeRoomItem('roomCode', roomId);
  
  // Notify that localStorage has changed
  window.dispatchEvent(new CustomEvent('pokersessionschanged', { detail: { roomId } }));
};

/**
 * Check if the user is the host of a room
 * 
 * @param {string} roomId - The room ID to check host status for
 * @returns {boolean} True if the user is the host
 */
export const isUserHost = (roomId) => {
  return getRoomItem('isHost', roomId) === 'true';
};

/**
 * Check if the user participates in voting for a room
 * 
 * @param {string} roomId - The room ID to check participation status for
 * @returns {boolean} True if the user participates in voting
 */
export const isUserParticipant = (roomId) => {
  const isParticipant = getRoomItem('isParticipant', roomId);
  return isParticipant === null || isParticipant === 'true'; // Default to true for backward compatibility
};

/**
 * Get the user's session ID for a room
 * 
 * @param {string} roomId - The room ID
 * @returns {string|null} The session ID or null if not found
 */
export const getSessionId = (roomId) => {
  return getRoomItem('sessionId', roomId);
};

/**
 * Get the user's name for a room
 * 
 * @param {string} roomId - The room ID
 * @returns {string|null} The user name or null if not found
 */
export const getUserName = (roomId) => {
  return getRoomItem('userName', roomId);
};

/**
 * Save user session data to localStorage
 * 
 * @param {Object} data - Session data object
 * @param {string} data.roomId - The room ID
 * @param {string} data.sessionId - The session ID
 * @param {string} data.userName - The user name
 * @param {boolean} data.isHost - Whether the user is the host
 * @param {boolean} data.isParticipant - Whether the user participates in voting
 */
export const saveUserSession = ({ roomId, sessionId, userName, isHost, isParticipant = true }) => {
  setRoomItem('roomCode', roomId, roomId);
  setRoomItem('sessionId', roomId, sessionId);
  setRoomItem('userName', roomId, userName);
  setRoomItem('isHost', roomId, isHost ? 'true' : 'false');
  setRoomItem('isParticipant', roomId, isParticipant ? 'true' : 'false');
  
  // Notify that localStorage has changed
  window.dispatchEvent(new CustomEvent('pokersessionschanged', { detail: { roomId } }));
};

/**
 * Mark a room as being deleted by the current user
 * 
 * @param {string} roomId - The room ID being deleted
 */
export const markRoomDeleting = (roomId) => {
  setRoomItem('deletingRoom', roomId, roomId);
};

/**
 * Get all active sessions from localStorage
 * 
 * @returns {Array} Array of active session objects with roomId, userName, and sessionId
 */
export const getActiveSessions = () => {
  const sessions = [];
  const roomPattern = new RegExp(`^${PREFIX}roomCode_(.+)$`);
  
  // Iterate through all localStorage items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const match = key.match(roomPattern);
    
    if (match) {
      const roomId = match[1];
      const userName = getUserName(roomId);
      const sessionId = getSessionId(roomId);
      const isHost = isUserHost(roomId);
      const isParticipant = isUserParticipant(roomId);
      
      if (roomId && userName && sessionId) {
        sessions.push({
          roomId,
          userName,
          sessionId,
          isHost,
          isParticipant
        });
      }
    }
  }
  
  return sessions;
};

/**
 * Check if a session already exists for a specific room
 * 
 * @param {string} roomId - The room ID to check
 * @returns {object|null} Session object if exists, null otherwise
 */
export const getSessionForRoom = (roomId) => {
  const sessionId = getSessionId(roomId);
  const userName = getUserName(roomId);
  const isHost = isUserHost(roomId);
  const isParticipant = isUserParticipant(roomId);
  
  if (sessionId && userName) {
    return {
      roomId,
      sessionId,
      userName,
      isHost,
      isParticipant
    };
  }
  
  return null;
};

export default {
  getRoomItem,
  setRoomItem,
  removeRoomItem,
  clearRoomData,
  isUserHost,
  isUserParticipant,
  getSessionId,
  getUserName,
  saveUserSession,
  markRoomDeleting,
  getActiveSessions,
  getSessionForRoom
};