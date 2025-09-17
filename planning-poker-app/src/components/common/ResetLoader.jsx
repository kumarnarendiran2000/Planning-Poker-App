import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResetLoader - Shows loading state during vote reset process
 * Displays for both host and participants during reset operation
 */
const ResetLoader = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        {/* Animated spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
        {/* Loading message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Resetting Votes
        </h3>
        <p className="text-gray-600">
          Resetting votes in room...
        </p>
        
        {/* Progress dots animation */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

ResetLoader.propTypes = {
  isVisible: PropTypes.bool.isRequired
};

export default ResetLoader;