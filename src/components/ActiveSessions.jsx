import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as StorageUtils from '../utils/localStorage';
import RoomService from '../services/roomService';
import enhancedToast from '../utils/enhancedToast.jsx';

/**
 * Component to display and manage active planning poker sessions
 */
const ActiveSessions = ({ onSessionDeleted }) => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  // Load active sessions on component mount and listen for changes
  useEffect(() => {
    const loadSessions = () => {
      const activeSessions = StorageUtils.getActiveSessions();
      setSessions(activeSessions);
    };

    // Load initially
    loadSessions();

    // Listen for custom event when localStorage sessions change
    const handleSessionsChange = () => {
      loadSessions();
    };

    // Listen for storage events (when localStorage changes in other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('poker_')) {
        loadSessions();
      }
    };

    window.addEventListener('pokersessionschanged', handleSessionsChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pokersessionschanged', handleSessionsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Handle joining an existing session
   */
  const handleJoinSession = (session) => {
    navigate(`/room/${session.roomId}`);
  };

  /**
   * Handle deleting a session
   */
  const handleDeleteSession = async (session) => {
    // For hosts/facilitators, warn them to transfer role first
    if (session.isHost) {
      const confirmLeave = window.confirm(
        `⚠️ You are the host of room ${session.roomId}.\n\n` +
        `To leave this room, you should first transfer your host role to another participant.\n\n` +
        `Click OK to enter the room and transfer your role, or Cancel to stay.`
      );

      if (confirmLeave) {
        navigate(`/room/${session.roomId}`);
      }
      return;
    }

    try {
      // Show loading toast
      const loadingToast = enhancedToast.loading('Leaving room...');

      // First try to remove participant from Firebase if room still exists
      try {
        const roomExists = await RoomService.checkRoomExists(session.roomId);
        if (roomExists && session.sessionId) {
          // Remove participant with email notification
          await RoomService.removeParticipant(session.roomId, session.sessionId, session.userName, 'left');

          // Check if the room is now empty and should be deleted
          try {
            await RoomService.deleteRoomIfEmpty(session.roomId);
          } catch (deleteError) {
            // Failed to check/delete empty room
          }
        }
      } catch (firebaseError) {
        // If Firebase removal fails, still continue with localStorage cleanup
      }

      // Clear the room data from localStorage
      StorageUtils.clearRoomData(session.roomId);

      // Update the sessions list
      const updatedSessions = sessions.filter(s => s.roomId !== session.roomId);
      setSessions(updatedSessions);

      // Dismiss loading toast and show success message
      enhancedToast.dismiss(loadingToast);
      enhancedToast.success(`Left room ${session.roomId} successfully`);

      // Call the callback if provided
      if (onSessionDeleted) {
        onSessionDeleted(session.roomId);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      enhancedToast.error('Failed to leave room completely. Please try again.');
    }
  };

  // Show "No active sessions" message if empty
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-5xl mb-3 opacity-50">🗂️</div>
        <p className="text-gray-500 font-medium text-sm mb-1">No Active Sessions</p>
        <p className="text-xs text-gray-400">Create or join a room to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sessions.map((session) => (
        <div
          key={session.roomId}
          className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Room Code</div>
              <div className="font-mono font-bold text-sm text-gray-900 tracking-wider truncate">{session.roomId}</div>
            </div>
            {(() => {
              // Determine role badge
              let role = null;
              let badgeStyle = '';
              let icon = '';

              if (session.isHost && session.isParticipant) {
                role = 'Host';
                icon = '👑';
                badgeStyle = 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200';
              } else if (session.isHost && !session.isParticipant) {
                role = 'Facilitator';
                icon = '🎯';
                badgeStyle = 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200';
              } else {
                role = 'Participant';
                icon = '👤';
                badgeStyle = 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border border-purple-200';
              }

              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeStyle}`}>
                  <span>{icon}</span>
                  <span>{role}</span>
                </span>
              );
            })()}
          </div>

          <div className="mb-2">
            <div className="text-xs font-medium text-gray-500 mb-0.5">Name</div>
            <div className="text-sm font-medium text-gray-800 truncate">{session.userName}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleJoinSession(session)}
              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Join
            </button>
            <button
              onClick={() => handleDeleteSession(session)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs font-semibold rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-300"
              title="Leave room and remove your participation"
            >
              Leave
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

ActiveSessions.propTypes = {
  /** Callback function called when a session is deleted */
  onSessionDeleted: PropTypes.func
};

export default ActiveSessions;