import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Error state component for non-existent or expired rooms.
 * Shows an error message and auto-redirects to home after a countdown.
 */
const RoomErrorState = ({ roomId }) => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigate('/', { replace: true });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-red-600 mb-2">Room Not Found</h1>
        <p className="text-gray-700 mb-2">
          Room <span className="font-mono font-semibold">"{roomId}"</span> no longer exists.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          It may have expired (rooms auto-delete after 4 hours) or been closed by the host.
        </p>

        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mb-3"
        >
          Go to Home
        </button>

        <p className="text-xs text-gray-400">
          Redirecting automatically in {seconds} second{seconds !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
};

export default RoomErrorState;
