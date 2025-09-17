/**
 * Room helper utilities
 * Common room-related operations extracted for reusability
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique room code
 * @returns {string} 6-character uppercase room code
 */
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Generate a unique session ID
 * @returns {string} 8-character session ID
 */
export const generateSessionId = () => {
  return uuidv4().substring(0, 8);
};

/**
 * Check if user is the only participant in the room
 * @param {Object} participants - Participants object
 * @param {string} currentSessionId - Current user's session ID
 * @returns {boolean} True if user is alone
 */
export const isUserAloneInRoom = (participants, currentSessionId) => {
  if (!participants || !currentSessionId) return true;
  
  const participantIds = Object.keys(participants);
  return participantIds.length === 1 && participantIds[0] === currentSessionId;
};

/**
 * Get participant count
 * @param {Object} participants - Participants object
 * @returns {number} Number of participants
 */
export const getParticipantCount = (participants) => {
  return participants ? Object.keys(participants).length : 0;
};

/**
 * Check if all participants have voted
 * @param {Object} participants - Participants object
 * @returns {boolean} True if all have voted
 */
export const haveAllParticipantsVoted = (participants) => {
  if (!participants) return false;
  
  const participantsList = Object.values(participants);
  if (participantsList.length === 0) return false;
  
  return participantsList.every(participant => 
    participant.vote !== null && participant.vote !== undefined
  );
};

/**
 * Get voting progress
 * @param {Object} participants - Participants object
 * @returns {Object} { voted: number, total: number, percentage: number }
 */
export const getVotingProgress = (participants) => {
  if (!participants) {
    return { voted: 0, total: 0, percentage: 0 };
  }
  
  const participantsList = Object.values(participants);
  const total = participantsList.length;
  const voted = participantsList.filter(p => 
    p.vote !== null && p.vote !== undefined
  ).length;
  
  const percentage = total > 0 ? Math.round((voted / total) * 100) : 0;
  
  return { voted, total, percentage };
};

/**
 * Format room status for display
 * @param {Object} participants - Participants object
 * @param {boolean} revealed - Whether votes are revealed
 * @returns {string} Status message
 */
export const getRoomStatusMessage = (participants, revealed) => {
  const { voted, total } = getVotingProgress(participants);
  
  if (total === 0) {
    return 'Waiting for participants...';
  }
  
  if (revealed) {
    return 'Votes revealed - Ready for new round';
  }
  
  if (voted === total) {
    return 'All votes submitted - Ready to reveal';
  }
  
  return `${voted} of ${total} voted`;
};

/**
 * Check if participant was recently removed
 * @param {Object} prevParticipants - Previous participants state
 * @param {Object} newParticipants - New participants state
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} True if participant was removed
 */
export const wasParticipantRemoved = (prevParticipants, newParticipants, sessionId) => {
  if (!sessionId || !prevParticipants) return false;
  
  const wasInRoom = prevParticipants[sessionId];
  const stillInRoom = newParticipants?.[sessionId];
  const hadParticipants = Object.keys(prevParticipants).length > 0;
  
  return wasInRoom && !stillInRoom && hadParticipants;
};