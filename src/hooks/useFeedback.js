import { useCallback } from 'react';
import feedbackService from '../services/feedbackService';
import enhancedToast from '../utils/enhancedToast.jsx';

// Import constants directly to avoid runtime access issues
const FEEDBACK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  GENERAL: 'general',
  UI_UX: 'ui-ux',
  PERFORMANCE: 'performance'
};

const USER_ROLES = {
  HOST: 'host',
  PARTICIPANT: 'participant',
  FACILITATOR: 'facilitator'
};



// Validation functions
const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMobile = (mobile) => {
  if (!mobile) return true; // Mobile is optional
  // Basic validation: 10-15 digits, can include +, -, spaces, ()
  const mobileRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,18}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
};

/**
 * Hook for managing feedback operations
 * Provides utilities for submitting and managing user feedback
 */
export const useFeedback = () => {
  /**
   * Submit feedback with error handling and user notifications
   * @param {Object} feedbackData - The feedback data to submit
   * @returns {Promise<string|null>} Promise resolving to feedback ID or null on error
   */
  const submitFeedback = useCallback(async (feedbackData) => {
    try {
      // Show loading toast
      enhancedToast.info('Submitting your feedback...');
      
      const feedbackId = await feedbackService.submitFeedback(feedbackData);
      
      // Show success toast
      enhancedToast.dismiss(); // Dismiss loading toast
      enhancedToast.success('Thank you! Your feedback has been submitted successfully.');
      
      return feedbackId;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Show error toast with appropriate message
      enhancedToast.dismiss(); // Dismiss loading toast
      
      if (error.message.includes('required')) {
        enhancedToast.error('Please fill in all required fields.');
      } else if (error.message.includes('Firestore not available')) {
        enhancedToast.error('Feedback service is currently unavailable. Please try again later.');
      } else {
        enhancedToast.error('Failed to submit feedback. Please check your connection and try again.');
      }
      
      return null;
    }
  }, []);

  /**
   * Get the appropriate user role based on room context
   * @param {boolean} isHost - Whether the user is a host
   * @param {boolean} isParticipant - Whether the user participates in voting
   * @returns {string} The user role for feedback context
   */
  const getUserRole = useCallback((isHost, isParticipant = true) => {
    if (isHost && !isParticipant) {
      return USER_ROLES.FACILITATOR;
    } else if (isHost && isParticipant) {
      return USER_ROLES.HOST;
    } else {
      return USER_ROLES.PARTICIPANT;
    }
  }, []);

  /**
   * Validate feedback data before submission
   * @param {Object} feedbackData - The feedback data to validate
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  const validateFeedbackData = useCallback((feedbackData) => {
    const errors = [];

    // Required fields
    if (!feedbackData.type) {
      errors.push('Feedback type is required');
    }

    if (!feedbackData.feedback || feedbackData.feedback.trim().length < 3) {
      errors.push('Feedback must be at least 3 characters long');
    }

    if (feedbackData.feedback && feedbackData.feedback.trim().length > 2000) {
      errors.push('Feedback must be less than 2000 characters');
    }

    // Optional field validations
    if (feedbackData.userDetails?.email && !validateEmail(feedbackData.userDetails.email)) {
      errors.push('Please enter a valid email address');
    }

    if (feedbackData.userDetails?.mobile && !validateMobile(feedbackData.userDetails.mobile)) {
      errors.push('Please enter a valid mobile number');
    }

    // Room context validation
    if (!feedbackData.roomContext?.roomId) {
      errors.push('Room context is required');
    }

    if (!feedbackData.roomContext?.userRole) {
      errors.push('User role is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * Get feedback statistics (if needed for analytics)
   * @returns {Promise<Object>} Promise resolving to feedback statistics
   */
  const getFeedbackStats = useCallback(async () => {
    try {
      const recentFeedback = await feedbackService.getRecentFeedback(100);
      
      const stats = {
        total: recentFeedback.length,
        byType: {},
        byRating: {},
        avgRating: 0
      };

      let totalRating = 0;
      let ratingCount = 0;

      recentFeedback.forEach(feedback => {
        // Count by type
        stats.byType[feedback.type] = (stats.byType[feedback.type] || 0) + 1;
        
        // Count by rating
        if (feedback.rating) {
          stats.byRating[feedback.rating] = (stats.byRating[feedback.rating] || 0) + 1;
          totalRating += feedback.rating;
          ratingCount++;
        }
      });

      // Calculate average rating
      if (ratingCount > 0) {
        stats.avgRating = (totalRating / ratingCount).toFixed(1);
      }

      return stats;
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return {
        total: 0,
        byType: {},
        byRating: {},
        avgRating: 0
      };
    }
  }, []);

  return {
    submitFeedback,
    getUserRole,
    validateFeedbackData,
    getFeedbackStats,
    // Export constants for component use
    FEEDBACK_TYPES,
    USER_ROLES
  };
};