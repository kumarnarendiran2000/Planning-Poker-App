import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 404 Not Found page — shown for any unrecognised route.
 * Matches the app's indigo/purple gradient design language.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(8);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mx-auto mb-6 shadow-inner">
          <span className="text-4xl select-none">🃏</span>
        </div>

        {/* Error code */}
        <p className="text-8xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 leading-none">
          404
        </p>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>

        <p className="text-sm text-gray-500 mb-1">
          The page{' '}
          <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-xs">
            {location.pathname}
          </span>{' '}
          doesn't exist.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          It may have been moved, deleted, or you may have mistyped the URL.
        </p>

        {/* Actions */}
        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mb-3"
        >
          Go to Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full px-6 py-3 bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200"
        >
          Go Back
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Redirecting to home in {seconds} second{seconds !== 1 ? 's' : ''}...
        </p>
      </div>

      {/* Footer hint */}
      <p className="mt-6 text-xs text-gray-400">
        Planning Poker · Real-time Agile Estimation
      </p>
    </div>
  );
};

export default NotFoundPage;
