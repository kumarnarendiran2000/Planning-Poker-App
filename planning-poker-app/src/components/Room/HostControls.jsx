import React from 'react';
import PropTypes from 'prop-types';

/**
 * HostControls component for room host actions
 */
const HostControls = ({ revealed, onReveal, onReset, onDelete }) => {
  return (
    <div className="mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6 border-t border-indigo-100">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Host Controls
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={onReveal}
          disabled={revealed}
          className={`flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base rounded-xl font-medium transition-all duration-200 flex-1 ${
            revealed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          <span className="text-base sm:text-xl">👁️</span>
          <span className="truncate">Reveal Votes</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex-1"
        >
          <span className="text-base sm:text-xl">🔄</span>
          <span className="truncate">Reset Votes</span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex-1"
        >
          <span className="text-base sm:text-xl">🗑️</span>
          <span className="truncate">Delete Room</span>
        </button>
      </div>
    </div>
  );
};

HostControls.propTypes = {
  /** Whether votes are revealed */
  revealed: PropTypes.bool.isRequired,
  /** Function to handle revealing votes */
  onReveal: PropTypes.func.isRequired,
  /** Function to handle resetting votes */
  onReset: PropTypes.func.isRequired,
  /** Function to handle deleting room */
  onDelete: PropTypes.func.isRequired
};

export default HostControls;