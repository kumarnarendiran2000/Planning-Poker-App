/**
 * Room cleanup service - Test Version
 * Handles automatic cleanup of old rooms (6+ hours old)
 */

import RoomService from './roomService';

// Track when cleanup was last run to avoid running too frequently
const CLEANUP_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CLEANUP_STORAGE_KEY = 'lastCleanupTime';

/**
 * Check if cleanup should run
 * @returns {boolean} True if cleanup should run
 */
const shouldRunCleanup = () => {
  const lastCleanup = localStorage.getItem(CLEANUP_STORAGE_KEY);
  if (!lastCleanup) return true;
  
  const timeSinceLastCleanup = Date.now() - parseInt(lastCleanup);
  return timeSinceLastCleanup >= CLEANUP_INTERVAL;
};

/**
 * Mark cleanup as completed
 */
const markCleanupCompleted = () => {
  localStorage.setItem(CLEANUP_STORAGE_KEY, Date.now().toString());
};

/**
 * Run room cleanup if needed
 * This is designed to be called when users visit the app
 * @returns {Promise<Object|null>} Cleanup result or null if not needed
 */
export const runCleanupIfNeeded = async () => {
  try {
    if (!shouldRunCleanup()) {
      return null;
    }

    const result = await RoomService.cleanupOldRooms();
    markCleanupCompleted();
    return result;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    // Don't mark as completed if it failed
    return { error: error.message, deletedCount: 0 };
  }
};

/**
 * Force run cleanup (for manual testing/admin use)
 * @returns {Promise<Object>} Cleanup result
 */
export const forceCleanup = async () => {
  try {
    const result = await RoomService.cleanupOldRooms();
    markCleanupCompleted();
    return result;
  } catch (error) {
    console.error('❌ Force cleanup failed:', error);
    return { error: error.message, deletedCount: 0 };
  }
};

/**
 * Test cleanup with custom age threshold (for testing)
 * @param {number} hoursThreshold - Hours threshold for deletion (default 6)
 * @returns {Promise<Object>} Cleanup result
 */
export const testCleanup = async (hoursThreshold = 6) => {
  try {
    const result = await RoomService.cleanupOldRoomsWithThreshold(hoursThreshold);
    return result;
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
    return { error: error.message, deletedCount: 0 };
  }
};

/**
 * Get cleanup status
 * @returns {Object} Cleanup status information
 */
export const getCleanupStatus = () => {
  const lastCleanup = localStorage.getItem(CLEANUP_STORAGE_KEY);
  const now = Date.now();
  
  if (!lastCleanup) {
    return {
      lastCleanup: null,
      nextCleanup: 'Due now',
      shouldRun: true
    };
  }
  
  const lastCleanupTime = parseInt(lastCleanup);
  const timeSinceLastCleanup = now - lastCleanupTime;
  const timeUntilNextCleanup = CLEANUP_INTERVAL - timeSinceLastCleanup;
  
  return {
    lastCleanup: new Date(lastCleanupTime).toLocaleString(),
    nextCleanup: timeUntilNextCleanup > 0 
      ? `In ${Math.round(timeUntilNextCleanup / (60 * 60 * 1000))} hours`
      : 'Due now',
    shouldRun: timeUntilNextCleanup <= 0
  };
};

export default {
  runCleanupIfNeeded,
  forceCleanup,
  testCleanup,
  getCleanupStatus
};