import React from 'react';

/**
 * Banner shown at the top of the page when Firebase connection is lost.
 * Disappears automatically when connection is restored.
 */
const ConnectionBanner = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4 shadow-lg">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
      </span>
      Connection lost — reconnecting...
    </div>
  );
};

export default ConnectionBanner;
