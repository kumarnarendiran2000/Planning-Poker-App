/**
 * Room status and validation utilities
 * Helper functions for room state management
 */

import { get } from 'firebase/database';
import { getRoomRef } from './firebaseReferences';

/**
 * Check if a room exists and is accessible
 * @param {string} roomId - The room ID
 * @returns {Promise<boolean>} Promise resolving to true if room exists and is not being deleted
 */
export const checkRoomExists = async (roomId) => {
  try {
    if (!roomId) {
      return false;
    }
    
    const roomRef = getRoomRef(roomId);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    const roomData = snapshot.val();
    // Consider room as non-existent if it's being deleted
    if (roomData.status === 'deleting') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking room existence:', error);
    return false;
  }
};

/**
 * Get room data
 * @param {string} roomId - The room ID
 * @returns {Promise<Object|null>} Promise resolving to room data or null if not found
 */
export const getRoomData = async (roomId) => {
  try {
    if (!roomId) {
      return null;
    }
    
    const roomRef = getRoomRef(roomId);
    const snapshot = await get(roomRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting room data:', error);
    return null;
  }
};

/**
 * Check if a room is empty (has no participants)
 * @param {string} roomId - The room ID
 * @returns {Promise<boolean>} Promise resolving to true if room is empty
 */
export const isRoomEmpty = async (roomId) => {
  try {
    const roomData = await getRoomData(roomId);
    
    // Room doesn't exist or has no participants property
    if (!roomData || !roomData.participants) {
      return true;
    }
    
    // Check if participants object is empty
    return Object.keys(roomData.participants).length === 0;
  } catch (error) {
    console.error('Error checking if room is empty:', error);
    throw error;
  }
};

/**
 * Validate room data structure
 * @param {Object} roomData - Room data to validate
 * @returns {boolean} True if room data is valid
 */
export const isValidRoomData = (roomData) => {
  if (!roomData || typeof roomData !== 'object') {
    return false;
  }
  
  // Check for required room properties
  const hasValidStructure = typeof roomData.revealed === 'boolean';
  
  // Participants should be an object or undefined
  const hasValidParticipants = !roomData.participants || 
    (typeof roomData.participants === 'object' && !Array.isArray(roomData.participants));
  
  return hasValidStructure && hasValidParticipants;
};

/**
 * Get participant count from room data
 * @param {Object} roomData - Room data
 * @returns {number} Number of participants
 */
export const getParticipantCount = (roomData) => {
  if (!roomData || !roomData.participants) {
    return 0;
  }
  return Object.keys(roomData.participants).length;
};