/**
 * Validation utilities for the Planning Poker app
 * Extracted common validation logic for reusability and maintainability
 */

/**
 * Validate user name input
 * @param {string} name - The name to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateUserName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return { isValid: false, error: 'Please enter your name to continue' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Name must be 50 characters or less' };
  }
  
  return { isValid: true };
};

/**
 * Validate room code format
 * @param {string} roomCode - The room code to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateRoomCode = (roomCode) => {
  if (!roomCode || typeof roomCode !== 'string') {
    return { isValid: false, error: 'Room code is required' };
  }
  
  const trimmedCode = roomCode.trim().toUpperCase();
  
  if (trimmedCode.length === 0) {
    return { isValid: false, error: 'Please enter a room code' };
  }
  
  if (trimmedCode.length !== 6) {
    return { isValid: false, error: 'Room code must be 6 characters' };
  }
  
  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    return { isValid: false, error: 'Room code must contain only letters and numbers' };
  }
  
  return { isValid: true, sanitized: trimmedCode };
};

/**
 * Validate participant data structure
 * @param {Object} participantData - The participant data to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export const validateParticipantData = (participantData) => {
  if (!participantData || typeof participantData !== 'object') {
    return { isValid: false, error: 'Invalid participant data' };
  }
  
  const nameValidation = validateUserName(participantData.name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  if (participantData.vote !== null && participantData.vote !== undefined) {
    if (typeof participantData.vote !== 'string') {
      return { isValid: false, error: 'Vote must be a string value' };
    }
  }
  
  return { isValid: true };
};

/**
 * Sanitize user input to prevent XSS and other issues
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s-_.]/g, '') // Allow only word characters, spaces, hyphens, underscores, dots
    .substring(0, 100); // Limit length
};