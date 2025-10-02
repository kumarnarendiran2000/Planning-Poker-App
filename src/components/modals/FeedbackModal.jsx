import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import feedbackService from '../../services/feedbackService';
import { useFeedback } from '../../hooks/useFeedback';
import enhancedToast from '../../utils/enhancedToast.jsx';

/**
 * Professional Feedback Modal Component
 * Allows users to submit feedback, bug reports, feature requests, and suggestions
 */
const FeedbackModal = ({ isOpen, onClose, roomId, userRole, userName = '' }) => {
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    rating: 0,
    feedback: '',
    name: userName,
    email: '',
    mobile: ''
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: feedback form, 2: success message

  // Get feedback hook for constants and validation
  const { FEEDBACK_TYPES } = useFeedback();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: '',
        rating: 0,
        feedback: '',
        name: userName,
        email: '',
        mobile: ''
      });
      setErrors({});
      setStep(1);
    }
  }, [isOpen, userName]);

  // Feedback types with icons and descriptions
  const feedbackTypes = [
    {
      value: FEEDBACK_TYPES.BUG,
      label: 'Bug Report',
      icon: '🐛',
      description: 'Report a problem or error you encountered',
      selectedClass: 'border-red-500 bg-red-50',
      checkClass: 'bg-red-500'
    },
    {
      value: FEEDBACK_TYPES.FEATURE,
      label: 'Feature Request',
      icon: '💡',
      description: 'Suggest a new feature or enhancement',
      selectedClass: 'border-blue-500 bg-blue-50',
      checkClass: 'bg-blue-500'
    },
    {
      value: FEEDBACK_TYPES.UI_UX,
      label: 'UI/UX Improvement',
      icon: '🎨',
      description: 'Suggest interface or user experience improvements',
      selectedClass: 'border-purple-500 bg-purple-50',
      checkClass: 'bg-purple-500'
    },
    {
      value: FEEDBACK_TYPES.PERFORMANCE,
      label: 'Performance Issue',
      icon: '⚡',
      description: 'Report slow loading or performance problems',
      selectedClass: 'border-orange-500 bg-orange-50',
      checkClass: 'bg-orange-500'
    },
    {
      value: FEEDBACK_TYPES.GENERAL,
      label: 'General Feedback',
      icon: '💬',
      description: 'Share your thoughts and general suggestions',
      selectedClass: 'border-green-500 bg-green-50',
      checkClass: 'bg-green-500'
    }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle rating selection
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.type) {
      newErrors.type = 'Please select a feedback type';
    }

    if (!formData.rating || formData.rating === 0) {
      newErrors.rating = 'Please provide a rating for your experience';
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Please provide your feedback';
    } else if (formData.feedback.trim().length < 3) {
      newErrors.feedback = 'Please provide at least 3 characters of feedback';
    } else if (formData.feedback.trim().length > 2000) {
      newErrors.feedback = 'Feedback must be less than 2000 characters';
    }

    // Optional field validations - enhanced validation
    if (formData.name && formData.name.trim()) {
      if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      } else if (formData.name.trim().length > 50) {
        newErrors.name = 'Name must be less than 50 characters';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
      }
    }

    if (formData.mobile && formData.mobile.trim()) {
      // Mobile validation: 10-15 digits, can include +, -, spaces, ()
      const mobileRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,18}$/;
      const cleanMobile = formData.mobile.replace(/\s/g, '');
      if (!mobileRegex.test(cleanMobile) || cleanMobile.length < 10 || cleanMobile.length > 15) {
        newErrors.mobile = 'Please enter a valid mobile number (10-15 digits)';
      }
    }

    if (formData.mobile && formData.mobile.trim()) {
      const mobileRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,18}$/;
      if (!mobileRegex.test(formData.mobile.replace(/\s/g, ''))) {
        newErrors.mobile = 'Please enter a valid mobile number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        type: formData.type,
        rating: formData.rating || null,
        feedback: formData.feedback,
        userDetails: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile
        },
        roomContext: {
          roomId: roomId,
          userRole: userRole
        }
      };

      await feedbackService.submitFeedback(feedbackData);
      
      // Show success step
      setStep(2);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Provide more specific error messages based on error type
      if (error.code === 'permission-denied') {
        enhancedToast.error('Permission denied. Feedback service may not be properly configured.');
      } else if (error.code === 'unavailable') {
        enhancedToast.error('Service temporarily unavailable. Please try again in a moment.');
      } else if (error.message.includes('Firestore not available')) {
        enhancedToast.error('Feedback service is not available. Please try again later.');
      } else {
        enhancedToast.error('Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render feedback type selection
  const renderFeedbackTypes = () => (
    <div className="space-y-3">
      {feedbackTypes.map((type) => (
        <label
          key={type.value}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
            formData.type === type.value
              ? type.selectedClass
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="feedbackType"
            value={type.value}
            checked={formData.type === type.value}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="sr-only"
          />
          <div className="flex-shrink-0 text-2xl">{type.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">{type.label}</div>
            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
          </div>
          {formData.type === type.value && (
            <div className={`flex-shrink-0 w-5 h-5 rounded-full ${type.checkClass} flex items-center justify-center`}>
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </label>
      ))}
    </div>
  );

  // Render rating stars
  const renderRating = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-lg font-bold text-gray-800">Rate Your Experience *</span>
        <span className="text-red-500 text-xl">★</span>
      </div>
      
      <div className="flex items-center justify-center gap-4 py-8 bg-white rounded-lg">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 border-2 hover:scale-110 ${
              star <= formData.rating
                ? 'text-yellow-500 bg-yellow-100 border-yellow-400 shadow-lg'
                : 'text-gray-400 bg-gray-100 border-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
            }`}
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      
      <div className="text-center mt-4">
        {formData.rating > 0 ? (
          <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
            ⭐ {formData.rating} star{formData.rating !== 1 ? 's' : ''} selected
          </span>
        ) : (
          <span className="text-gray-500 text-sm">
            👆 Please select a rating above
          </span>
        )}
      </div>
    </div>
  );

  // Render success message
  const renderSuccessMessage = () => (
    <div className="relative">
      {/* Close button in top right corner */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You! 🎉</h3>
        <p className="text-gray-600 mb-6 text-lg">
          Your feedback has been submitted successfully. We appreciate your input and will review it carefully.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-sm mb-8">
          <div className="flex items-center gap-2 text-blue-800 mb-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-base">What happens next?</span>
          </div>
          <p className="text-blue-700 leading-relaxed">
            Our team will review your feedback and use it to improve the Planning Poker experience. 
            {formData.email && " If you provided your email, we may reach out if we need more details."}
          </p>
        </div>
        
        {/* OK Button */}
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
        >
          <span>✅</span>
          <span>OK, Got it!</span>
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={step === 2 ? onClose : onClose} size="lg" showOk={false} showCancel={false}>
      <div className="max-w-2xl mx-auto">
        {step === 1 ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Feedback</h2>
              <p className="text-gray-600">
                Help us improve Planning Poker by sharing your thoughts, reporting bugs, or suggesting new features.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of feedback would you like to share? *
                </label>
                {renderFeedbackTypes()}
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Rating */}
              {formData.type && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                  {renderRating()}
                  {errors.rating && (
                    <p className="mt-3 text-sm text-red-600 text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                      ⚠️ {errors.rating}
                    </p>
                  )}
                </div>
              )}

              {/* Feedback Text */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  id="feedback"
                  rows={6}
                  value={formData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  placeholder="📝 Please provide detailed feedback. Remember to select a feedback type and rating above! The more specific you are, the better we can help."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.feedback ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-2">
                  {errors.feedback ? (
                    <p className="text-sm text-red-600">{errors.feedback}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Minimum 3 characters</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {formData.feedback.length}/2000
                  </p>
                </div>
              </div>

              {/* Optional Contact Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Contact Information (Optional)
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Providing your contact details helps us follow up if we need clarification or want to update you on progress.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your name"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.mobile ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          renderSuccessMessage()
        )}
      </div>
    </Modal>
  );
};

FeedbackModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired,
  /** The room ID for context */
  roomId: PropTypes.string.isRequired,
  /** The user's role in the room */
  userRole: PropTypes.string.isRequired,
  /** The user's name (pre-filled if available) */
  userName: PropTypes.string
};

export default FeedbackModal;