import React from 'react';

/**
 * Error state component for non-existent rooms
 * Shows an error message when a room doesn't exist
 */
const RoomErrorState = ({ roomId }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-md text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Room Not Found</h1>
        <p className="text-gray-700 mb-4">
          Room "{roomId}" does not exist. Please check the room code and try again.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to home page in 3 seconds...
        </p>
      </div>
    </div>
  );
};

export default RoomErrorState;