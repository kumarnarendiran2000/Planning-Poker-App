/**
 * Form validation utilities
 * Common validation functions for user input forms
 */

/**
 * Validate user name input
 * @param {string} name - User name to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateUserName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Please enter your name' };
  }
  
  if (name.trim().length < 1) {
    return { isValid: false, error: 'Name cannot be empty' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate room code input
 * @param {string} roomCode - Room code to validate
 * @returns {Object} { isValid: boolean, error: string, cleanCode: string }
 */
export const validateRoomCode = (roomCode) => {
  if (!roomCode || !roomCode.trim()) {
    return { isValid: false, error: 'Please enter a room code', cleanCode: '' };
  }
  
  const cleanCode = roomCode.trim().toUpperCase();
  
  if (cleanCode.length !== 6) {
    return { isValid: false, error: 'Room code must be 6 characters', cleanCode };
  }
  
  // Check if code contains only alphanumeric characters
  if (!/^[A-Z0-9]+$/.test(cleanCode)) {
    return { isValid: false, error: 'Room code can only contain letters and numbers', cleanCode };
  }
  
  return { isValid: true, error: '', cleanCode };
};

/**
 * Validate form fields for creating a room
 * @param {string} name - User name
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateCreateRoom = (name) => {
  return validateUserName(name);
};

/**
 * Validate form fields for joining a room
 * @param {string} name - User name
 * @param {string} roomCode - Room code
 * @returns {Object} { isValid: boolean, error: string, cleanCode: string }
 */
export const validateJoinRoom = (name, roomCode) => {
  const nameValidation = validateUserName(name);
  if (!nameValidation.isValid) {
    return { isValid: false, error: nameValidation.error, cleanCode: '' };
  }
  
  const codeValidation = validateRoomCode(roomCode);
  if (!codeValidation.isValid) {
    return { isValid: false, error: codeValidation.error, cleanCode: codeValidation.cleanCode };
  }
  
  return { isValid: true, error: '', cleanCode: codeValidation.cleanCode };
};

/**
 * Clear error when user starts typing
 * @param {string} value - Current input value
 * @param {string} currentError - Current error message
 * @returns {string} Updated error message (empty if value is valid)
 */
export const clearErrorOnInput = (value, currentError) => {
  if (currentError && value.trim()) {
    return '';
  }
  return currentError;
};