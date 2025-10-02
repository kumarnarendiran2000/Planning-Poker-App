import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from '../modals/FeedbackModal';

/**
 * Floating Feedback Button Component
 * Professional feedback button that appears in the room interface
 */
const FeedbackButton = ({ roomId, userRole, userName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={handleOpenModal}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 p-3 sm:p-4 flex items-center gap-2"
          title="Share Feedback"
        >
          {/* Floating text label */}
          {isHovered && (
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Share Feedback
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
          )}

          {/* Icon */}
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roomId={roomId}
        userRole={userRole}
        userName={userName}
      />
    </>
  );
};

FeedbackButton.propTypes = {
  /** The room ID for context */
  roomId: PropTypes.string.isRequired,
  /** The user's role in the room */
  userRole: PropTypes.string.isRequired,
  /** The user's name (optional) */
  userName: PropTypes.string
};

export default FeedbackButton;