import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * RevealCountdown component - shows a 3-2-1 countdown before revealing votes
 */
const RevealCountdown = ({ isVisible, onComplete, onCancel, showCancelButton = false }) => {
  const [count, setCount] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCount(3);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setIsAnimating(false);
            onComplete();
          }, 500); // Small delay after "1" before revealing
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="text-center">
        {/* Countdown Number */}
        {count > 0 && (
          <div className="relative">
            <div 
              className={`text-6xl sm:text-8xl md:text-9xl font-bold text-white mb-6 transform transition-all duration-500 ${
                isAnimating ? 'scale-110 animate-pulse' : 'scale-100'
              }`}
              key={count} // Force re-render for animation
            >
              {count}
            </div>
            
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 border-white rounded-full animate-ping opacity-30`}
              />
            </div>
          </div>
        )}

        {/* "Revealing votes..." text when count reaches 0 */}
        {count === 0 && (
          <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white animate-pulse">
            Revealing votes...
          </div>
        )}

        {/* Instruction text */}
        <div className="text-lg sm:text-xl text-gray-300 mt-4">
          {count > 0 ? 'Get ready to reveal votes!' : 'Votes will be shown shortly'}
        </div>

        {/* Cancel button (only show for host during countdown) */}
        {count > 0 && showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg"
          >
            Cancel Reveal
          </button>
        )}
      </div>
    </div>
  );
};

RevealCountdown.propTypes = {
  /** Whether the countdown is visible */
  isVisible: PropTypes.bool.isRequired,
  /** Function called when countdown completes */
  onComplete: PropTypes.func.isRequired,
  /** Function called when user cancels countdown (optional) */
  onCancel: PropTypes.func,
  /** Whether to show the cancel button (host only) */
  showCancelButton: PropTypes.bool,
};

export default RevealCountdown;