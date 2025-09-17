import React from 'react';

/**
 * Loading state component for the room
 * Shows a loading spinner while the room is being initialized
 */
const RoomLoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-indigo-600 mb-2">Loading Room</h1>
        <p className="text-gray-600">Connecting to Planning Poker session...</p>
      </div>
    </div>
  );
};

export default RoomLoadingState;