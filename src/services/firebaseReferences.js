/**
 * Firebase reference utilities
 * Helper functions for creating Firebase references
 */

import { ref } from 'firebase/database';
import { db } from '../firebase/config';
import { FIREBASE_PATHS } from '../utils/constants';

/**
 * Get a reference to all rooms in Firebase
 * @returns {Object} Firebase reference
 */
export const getRoomsRef = () => {
  return ref(db, FIREBASE_PATHS.ROOMS);
};

/**
 * Get a reference to a room in Firebase
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getRoomRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}`);
};

/**
 * Get a reference to a participant in Firebase
 * @param {string} roomId - The room ID
 * @param {string} participantId - The participant ID
 * @returns {Object} Firebase reference
 */
export const getParticipantRef = (roomId, participantId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/participants/${participantId}`);
};

/**
 * Get a reference to room revealed status
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getRevealedRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/revealed`);
};

/**
 * Get a reference to room status
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getStatusRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/status`);
};

/**
 * Get a reference to a participant's vote
 * @param {string} roomId - The room ID
 * @param {string} participantId - The participant ID
 * @returns {Object} Firebase reference
 */
export const getVoteRef = (roomId, participantId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/participants/${participantId}/vote`);
};

/**
 * Get a reference to a participant's kicked status
 * @param {string} roomId - The room ID
 * @param {string} participantId - The participant ID
 * @returns {Object} Firebase reference
 */
export const getKickedRef = (roomId, participantId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/participants/${participantId}/kicked`);
};

/**
 * Get a reference to room reset notification
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getResetNotificationRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/resetNotification`);
};

/**
 * Get a reference to room countdown state
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getCountdownRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/countdown`);
};

/**
 * Get a reference to room reset state
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getResetStateRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/resetState`);
};

/**
 * Get a reference to room story
 * @param {string} roomId - The room ID
 * @returns {Object} Firebase reference
 */
export const getStoryRef = (roomId) => {
  return ref(db, `${FIREBASE_PATHS.ROOMS}/${roomId}/story`);
};

// Export all functions as a single object for easier usage
export default {
  getRoomsRef,
  getRoomRef,
  getParticipantRef,
  getRevealedRef,
  getStatusRef,
  getVoteRef,
  getKickedRef,
  getResetNotificationRef,
  getCountdownRef,
  getResetStateRef,
  getStoryRef
};