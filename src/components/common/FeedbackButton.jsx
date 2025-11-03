import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FeedbackModal from '../modals/FeedbackModal';

/**
 * Vertical Feedback Tab Component
 * Professional vertical feedback button aligned to the right edge
 */
const FeedbackButton = ({ roomId, userRole, userName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Vertical Feedback Tab - Right Edge, Bottom Position */}
      <div className="fixed right-0 bottom-32 sm:bottom-24 z-40">
        <button
          onClick={handleOpenModal}
          className="group relative bg-gradient-to-b from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:pr-1 flex items-center justify-center
                     py-3 px-1 rounded-l-md text-[10px] font-bold tracking-wide
                     sm:py-3 sm:px-1.5 sm:rounded-l-lg sm:text-[12px] sm:font-bold sm:tracking-wide"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          title="Share your feedback"
        >
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">💬</span>
            <span className="uppercase">Share</span>
            <span className="w-2 h-0.5 bg-white opacity-50"></span>
            <span className="uppercase">Feedback</span>
          </span>
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
  roomId: PropTypes.string,
  /** The user's role in the room */
  userRole: PropTypes.string,
  /** The user's name (optional) */
  userName: PropTypes.string
};

export default FeedbackButton;