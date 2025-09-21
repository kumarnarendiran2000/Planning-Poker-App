import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * RevealCountdown component - shows a countdown before revealing votes
 * Redesigned to match the app's design language like ResetLoader
 */
const RevealCountdown = ({ isVisible, onComplete, onCancel, showCancelButton = false }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isVisible) {
      setCount(3);
      return;
    }

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          setTimeout(() => {
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
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-indigo-100">
        {count > 0 ? (
          <>
            {/* Countdown Display */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Main countdown number with gradient background */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {count}
                  </span>
                </div>
                
                {/* Animated ring */}
                <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 border-4 border-indigo-300 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            
            {/* Revealing message */}
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Revealing Votes
            </h3>
            <p className="text-gray-600 mb-4">
              Get ready! Votes will be revealed in {count} second{count !== 1 ? 's' : ''}...
            </p>
          </>
        ) : (
          <>
            {/* Loading state when revealing */}
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Revealing Votes
            </h3>
            <p className="text-gray-600">
              Processing votes for reveal...
            </p>
          </>
        )}

        {/* Progress dots animation */}
        <div className="flex justify-center space-x-1 mt-6">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Cancel button (only show for host during countdown) */}
        {count > 0 && showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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