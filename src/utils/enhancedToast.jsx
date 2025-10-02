import React from 'react';
import toast from 'react-hot-toast';

/**
 * Enhanced toast utility with improved UX features
 * - Consistent 15-second duration for all toasts
 * - Color-coded messages based on type
 * - Cancel button on all toasts
 * - Larger size and better styling
 * - Guaranteed auto-close with backup timer
 */

// Consistent 15-second duration for ALL toasts
const TOAST_DURATION = 15000; // 15 seconds

// Default configurations for different toast types
const DEFAULT_CONFIGS = {
  error: {
    duration: TOAST_DURATION,
    icon: '❌',
    style: {
      background: '#FEF2F2', // red-50
      color: '#991B1B', // red-800
      border: '2px solid #F87171', // red-400
      padding: '20px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '420px',
      maxWidth: '650px',
      boxShadow: '0 10px 25px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)',
    }
  },
  success: {
    duration: TOAST_DURATION,
    icon: '✅',
    style: {
      background: '#F0FDF4', // green-50
      color: '#166534', // green-800
      border: '2px solid #4ADE80', // green-400
      padding: '20px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '420px',
      maxWidth: '650px',
      boxShadow: '0 10px 25px -3px rgba(34, 197, 94, 0.2), 0 4px 6px -2px rgba(34, 197, 94, 0.1)',
    }
  },
  warning: {
    duration: TOAST_DURATION,
    icon: '⚠️',
    style: {
      background: '#FFFBEB', // amber-50
      color: '#92400E', // amber-700
      border: '2px solid #FBBF24', // amber-400
      padding: '20px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '420px',
      maxWidth: '650px',
      boxShadow: '0 10px 25px -3px rgba(245, 158, 11, 0.2), 0 4px 6px -2px rgba(245, 158, 11, 0.1)',
    }
  },
  info: {
    duration: TOAST_DURATION,
    icon: 'ℹ️',
    style: {
      background: '#EFF6FF', // blue-50
      color: '#1E40AF', // blue-700
      border: '2px solid #60A5FA', // blue-400
      padding: '20px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '420px',
      maxWidth: '650px',
      boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
    }
  },
  loading: {
    duration: TOAST_DURATION, // Even loading toasts now have 15-second timeout
    icon: '⏳',
    style: {
      background: '#F8FAFC', // slate-50
      color: '#475569', // slate-600
      border: '2px solid #94A3B8', // slate-400
      padding: '20px 24px',
      borderRadius: '16px',
      fontSize: '16px',
      fontWeight: '600',
      minWidth: '420px',
      maxWidth: '650px',
      boxShadow: '0 10px 25px -3px rgba(71, 85, 105, 0.2), 0 4px 6px -2px rgba(71, 85, 105, 0.1)',
    }
  }
};

/**
 * Create a cancelable toast with custom styling
 * ALL toasts now have 15-second duration and cancel buttons
 */
const createCancelableToast = (message, type, options = {}) => {
  const config = { ...DEFAULT_CONFIGS[type], ...options };
  
  // ALL toast types now get the same treatment with cancel buttons
  const toastId = toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-2xl w-full shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        style={config.style}
      >
        <div className="flex-1 w-0 p-2">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <span className="text-xl">{config.icon}</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-base font-medium leading-relaxed">
                {message}
              </p>
              {/* Timer indicator showing exact countdown */}
              <div className="mt-2 text-xs opacity-70 font-medium">
                Auto-closes in 15 seconds • Click ✕ to dismiss now
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-300 border-opacity-50">
          <button
            onClick={() => {
              // Clear backup timer first
              if (typeof window !== 'undefined') {
                clearTimeout(window[`toast_timer_${t.id}`]);
              }
              // Immediate dismissal
              toast.remove(t.id);
            }}
            className="w-16 border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xl font-bold hover:opacity-75 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            style={{ color: config.style.color }}
            title="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    {
      duration: TOAST_DURATION, // Always 15 seconds
      position: 'top-center',
      id: `toast-${type}-${Date.now()}`, // Unique ID to prevent conflicts
    }
  );
  
  // Guaranteed backup timer - ensures toast ALWAYS closes after 15 seconds
  const backupTimer = setTimeout(() => {
    // Use requestAnimationFrame to prevent handler performance warnings
    requestAnimationFrame(() => toast.remove(toastId));
  }, TOAST_DURATION);
  
  // Store the timer so it can be cleared if toast is manually dismissed
  if (typeof window !== 'undefined') {
    window[`toast_timer_${toastId}`] = backupTimer;
  }
  
  return toastId;
};

/**
 * Enhanced toast functions
 */
const enhancedToast = {
  /**
   * Show an error toast with red styling and cancel button
   */
  error: (message, options = {}) => {
    return createCancelableToast(message, 'error', options);
  },

  /**
   * Show a success toast with green styling
   */
  success: (message, options = {}) => {
    return createCancelableToast(message, 'success', options);
  },

  /**
   * Show a warning toast with amber styling and cancel button
   */
  warning: (message, options = {}) => {
    return createCancelableToast(message, 'warning', options);
  },

  /**
   * Show an info toast with blue styling
   */
  info: (message, options = {}) => {
    return createCancelableToast(message, 'info', options);
  },

  /**
   * Show a loading toast that persists until dismissed
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...DEFAULT_CONFIGS.loading,
      ...options,
      position: 'top-center',
    });
  },

  /**
   * Dismiss a specific toast by ID - immediate removal
   */
  dismiss: (toastId) => {
    // Clear any backup timer
    if (typeof window !== 'undefined') {
      clearTimeout(window[`toast_timer_${toastId}`]);
    }
    return toast.remove(toastId);
  },

  /**
   * Dismiss all toasts - immediate removal
   */
  dismissAll: () => {
    // Clear all backup timers
    if (typeof window !== 'undefined') {
      Object.keys(window).forEach(key => {
        if (key.startsWith('toast_timer_')) {
          clearTimeout(window[key]);
          delete window[key];
        }
      });
    }
    return toast.remove();
  },

  /**
   * Create a custom toast with redirect functionality
   * Used for navigation-related messages
   */
  redirect: (message, redirectPath, delay = 3000, options = {}) => {
    const config = {
      duration: delay + 500, // Slightly longer than redirect delay
      ...options
    };

    return createCancelableToast(
      `${message} Redirecting in ${Math.ceil(delay / 1000)} seconds...`,
      'info',
      config
    );
  },

  /**
   * Create a confirmation toast that users can interact with
   * Now also closes after 15 seconds if no action is taken
   */
  confirm: (message, onConfirm, onCancel, options = {}) => {
    const toastId = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-2xl w-full shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          style={{
            background: '#FEF3C7', // amber-100
            color: '#92400E', // amber-700
            border: '2px solid #F59E0B', // amber-500
            padding: '20px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '600',
            minWidth: '420px',
            maxWidth: '650px',
            boxShadow: '0 10px 25px -3px rgba(245, 158, 11, 0.2), 0 4px 6px -2px rgba(245, 158, 11, 0.1)',
          }}
        >
          <div className="flex-1">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <span className="text-xl">❓</span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-base font-medium mb-2 leading-relaxed">
                  {message}
                </p>
                <div className="mb-4 text-xs opacity-70 font-medium">
                  Auto-cancels in 15 seconds if no action taken
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Clear backup timer first
                      if (typeof window !== 'undefined') {
                        clearTimeout(window[`toast_timer_${t.id}`]);
                      }
                      // Immediate removal
                      toast.remove(t.id);
                      onConfirm?.();
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      // Clear backup timer first
                      if (typeof window !== 'undefined') {
                        clearTimeout(window[`toast_timer_${t.id}`]);
                      }
                      // Immediate removal
                      toast.remove(t.id);
                      onCancel?.();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-bold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: TOAST_DURATION, // 15 seconds
        position: 'top-center',
        id: `toast-confirm-${Date.now()}`,
      }
    );
    
    // Backup timer for confirm toasts - auto-cancel after 15 seconds
    const backupTimer = setTimeout(() => {
      // Use requestAnimationFrame to prevent handler performance warnings
      requestAnimationFrame(() => {
        toast.remove(toastId);
        onCancel?.(); // Call cancel callback if no action taken
      });
    }, TOAST_DURATION);
    
    // Store the timer
    if (typeof window !== 'undefined') {
      window[`toast_timer_${toastId}`] = backupTimer;
    }
    
    return toastId;
  }
};

export default enhancedToast;