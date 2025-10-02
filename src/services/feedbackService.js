import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { firestore } from '../firebase/config';

/**
 * Firestore service for managing user feedback
 * Separate from the main Firebase Realtime Database for Planning Poker rooms
 */
class FeedbackService {
  constructor() {
    // Collection name for feedback documents
    this.collectionName = 'feedbacks';
    
    if (!firestore) {
      console.warn('Firestore not initialized. Feedback service will be disabled.');
      this.feedbackCollection = null;
    } else {
      this.feedbackCollection = collection(firestore, this.collectionName);
    }
  }

  /**
   * Feedback types available in the system
   */
  static FEEDBACK_TYPES = {
    BUG: 'bug',
    FEATURE: 'feature',
    GENERAL: 'general',
    UI_UX: 'ui-ux',
    PERFORMANCE: 'performance'
  };

  /**
   * User roles for context
   */
  static USER_ROLES = {
    HOST: 'host',
    PARTICIPANT: 'participant',
    FACILITATOR: 'facilitator'
  };



  /**
   * Submit new feedback
   * @param {Object} feedbackData - The feedback data
   * @param {string} feedbackData.type - Type of feedback (bug, feature, etc.)
   * @param {number} feedbackData.rating - Rating from 1-5
   * @param {string} feedbackData.feedback - The feedback text
   * @param {Object} feedbackData.userDetails - Optional user contact details
   * @param {string} feedbackData.userDetails.name - User's name (optional)
   * @param {string} feedbackData.userDetails.email - User's email (optional)
   * @param {string} feedbackData.userDetails.mobile - User's mobile (optional)
   * @param {Object} feedbackData.roomContext - Room context information
   * @param {string} feedbackData.roomContext.roomId - The room ID
   * @param {string} feedbackData.roomContext.userRole - User's role in the room
   * @returns {Promise<string>} Promise resolving to the feedback document ID
   */
  async submitFeedback(feedbackData) {
    if (!this.feedbackCollection) {
      console.error('Firestore not initialized');
      throw new Error('Firestore not available. Cannot submit feedback.');
    }

    try {
      console.log('Attempting to submit feedback to collection:', this.collectionName);
      
      // Validate required fields
      if (!feedbackData.type || !feedbackData.feedback) {
        throw new Error('Feedback type and content are required.');
      }

      if (!feedbackData.roomContext?.roomId || !feedbackData.roomContext?.userRole) {
        throw new Error('Room context is required.');
      }

      // Prepare the document data
      const docData = {
        type: feedbackData.type,
        rating: feedbackData.rating || null,
        feedback: feedbackData.feedback.trim(),
        userDetails: {
          name: feedbackData.userDetails?.name?.trim() || '',
          email: feedbackData.userDetails?.email?.trim() || '',
          mobile: feedbackData.userDetails?.mobile?.trim() || ''
        },
        roomContext: {
          roomId: feedbackData.roomContext.roomId,
          userRole: feedbackData.roomContext.userRole,
          timestamp: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add the document to Firestore
      console.log('Submitting feedback data:', docData);
      const docRef = await addDoc(this.feedbackCollection, docData);
      
      console.log('Feedback submitted successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get recent feedback for analytics/admin purposes
   * @param {number} limitCount - Number of feedback items to retrieve
   * @returns {Promise<Array>} Promise resolving to array of feedback documents
   */
  async getRecentFeedback(limitCount = 50) {
    if (!this.feedbackCollection) {
      throw new Error('Firestore not available. Cannot retrieve feedback.');
    }

    try {
      const q = query(
        this.feedbackCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const feedbacks = [];

      querySnapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return feedbacks;
    } catch (error) {
      console.error('Error retrieving feedback:', error);
      throw error;
    }
  }



  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  static validateEmail(email) {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate mobile format (basic validation)
   * @param {string} mobile - Mobile number to validate
   * @returns {boolean} True if mobile is valid
   */
  static validateMobile(mobile) {
    if (!mobile) return true; // Mobile is optional
    // Basic validation: 10-15 digits, can include +, -, spaces, ()
    const mobileRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,18}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
  }

  /**
   * Get feedback type display name
   * @param {string} type - Feedback type
   * @returns {string} Display name for the feedback type
   */
  static getFeedbackTypeDisplay(type) {
    const typeMap = {
      [FeedbackService.FEEDBACK_TYPES.BUG]: 'Bug Report',
      [FeedbackService.FEEDBACK_TYPES.FEATURE]: 'Feature Request',
      [FeedbackService.FEEDBACK_TYPES.GENERAL]: 'General Feedback',
      [FeedbackService.FEEDBACK_TYPES.UI_UX]: 'UI/UX Improvement',
      [FeedbackService.FEEDBACK_TYPES.PERFORMANCE]: 'Performance Issue'
    };
    return typeMap[type] || 'Unknown';
  }

  /**
   * Get user role display name
   * @param {string} role - User role
   * @returns {string} Display name for the user role
   */
  static getUserRoleDisplay(role) {
    const roleMap = {
      [FeedbackService.USER_ROLES.HOST]: 'Host',
      [FeedbackService.USER_ROLES.PARTICIPANT]: 'Participant',
      [FeedbackService.USER_ROLES.FACILITATOR]: 'Facilitator'
    };
    return roleMap[role] || 'Unknown';
  }
}

// Create and export a singleton instance
const feedbackService = new FeedbackService();

// Also export the class for accessing static methods
export { FeedbackService };
export default feedbackService;