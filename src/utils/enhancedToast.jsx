import React from 'react';
import toast from 'react-hot-toast';

/**
 * Enhanced toast utility
 * Sensible durations, clean styling, dismiss button on all toasts.
 */

const DURATIONS = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 5000,
};

const CONFIGS = {
  error: {
    icon: '❌',
    style: {
      background: '#FEF2F2',
      color: '#991B1B',
      border: '2px solid #F87171',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
    },
  },
  success: {
    icon: '✅',
    style: {
      background: '#F0FDF4',
      color: '#166534',
      border: '2px solid #4ADE80',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
    },
  },
  warning: {
    icon: '⚠️',
    style: {
      background: '#FFFBEB',
      color: '#92400E',
      border: '2px solid #FBBF24',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
    },
  },
  info: {
    icon: 'ℹ️',
    style: {
      background: '#EFF6FF',
      color: '#1E40AF',
      border: '2px solid #60A5FA',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
    },
  },
  loading: {
    style: {
      background: '#F8FAFC',
      color: '#475569',
      border: '2px solid #94A3B8',
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      maxWidth: '480px',
      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)',
    },
  },
};

const createToast = (message, type, options = {}) => {
  const config = CONFIGS[type];
  const duration = options.duration ?? DURATIONS[type];

  return toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full pointer-events-auto flex items-start`}
        style={config.style}
      >
        <span className="flex-shrink-0 mr-3 mt-0.5 text-base">{config.icon}</span>
        <p className="flex-1 text-sm leading-snug">{message}</p>
        <button
          onClick={() => toast.remove(t.id)}
          className="flex-shrink-0 ml-3 opacity-50 hover:opacity-100 text-lg leading-none focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    ),
    {
      duration,
      position: 'top-center',
    }
  );
};

const enhancedToast = {
  error: (message, options = {}) => createToast(message, 'error', options),

  success: (message, options = {}) => createToast(message, 'success', options),

  warning: (message, options = {}) => createToast(message, 'warning', options),

  info: (message, options = {}) => createToast(message, 'info', options),

  /**
   * Loading toast — persists until explicitly dismissed.
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-center',
      style: {
        ...CONFIGS.loading.style,
      },
      ...options,
    });
  },

  /**
   * Dismiss a specific toast by ID.
   */
  dismiss: (toastId) => toast.dismiss(toastId),

  /**
   * Dismiss all active toasts.
   */
  dismissAll: () => toast.remove(),

  /**
   * Redirect toast — info variant with "Redirecting..." appended.
   */
  redirect: (message, delay = 3000) => {
    return createToast(
      `${message} Redirecting in ${Math.ceil(delay / 1000)}s...`,
      'info',
      { duration: delay + 500 }
    );
  },
};

export default enhancedToast;
