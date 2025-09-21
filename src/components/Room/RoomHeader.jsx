import React, { useState } from 'react';

/**
 * Room header component containing title and room information
 * Displays the room title, room ID, host badge, and participant count if applicable
 */
const RoomHeader = ({ roomId, isHost, isParticipant = true, participantCount }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="pt-1 pb-2 sm:pb-3">
      {/* Ultra-compact title */}
      <div className="w-full text-center overflow-visible py-0.5">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent mb-1 tracking-tight leading-relaxed">
          Planning Poker
        </h1>
      </div>
      
      {/* Room Details Section with improved typography */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-1">
        <div className="flex items-center gap-1 px-4 py-2 sm:px-6 sm:py-3 bg-purple-100 text-purple-700 rounded-full text-sm sm:text-base font-medium shadow-sm border border-purple-200 hover:shadow-md">
          <span>Room: {roomId}</span>
          <button
            onClick={handleCopyRoomCode}
            className="ml-2 p-1 hover:bg-purple-200 rounded-full focus:outline-none"
            title={copied ? 'Copied!' : 'Copy room code'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        {isHost && isParticipant && (
          <span className="px-4 py-2 sm:px-6 sm:py-3 bg-green-100 text-green-700 rounded-full text-sm sm:text-base font-medium shadow-sm border border-green-200 hover:shadow-md">
            Host Participant
          </span>
        )}
        {isHost && !isParticipant && (
          <span className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-100 text-orange-700 rounded-full text-sm sm:text-base font-medium shadow-sm border border-orange-200 hover:shadow-md">
            Facilitator
          </span>
        )}
        {!isHost && participantCount > 0 && (
          <span className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-100 text-indigo-700 rounded-full text-sm sm:text-base font-medium shadow-sm border border-indigo-200 hover:shadow-md">
            Participant
          </span>
        )}
      </div>
    </header>
  );
};

export default RoomHeader;