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
    try {
      // Show loading toast
      const loadingToast = enhancedToast.loading('Leaving room...');
      
      // First try to remove participant from Firebase if room still exists
      try {
        const roomExists = await RoomService.checkRoomExists(session.roomId);
        if (roomExists && session.sessionId) {
          await RoomService.removeParticipant(session.roomId, session.sessionId);
          
          // If the leaving participant is the host, delete the entire room
          if (session.isHost) {
            try {
              // Mark that the host is deleting the room
              StorageUtils.markRoomDeleting(session.roomId);
              
              await RoomService.deleteRoom(session.roomId);
            } catch (deleteError) {
              // Failed to delete room after host left
            }
          } else {
            // If not the host, check if the room is now empty and should be deleted
            try {
              const wasDeleted = await RoomService.deleteRoomIfEmpty(session.roomId);
            } catch (deleteError) {
              // Failed to check/delete empty room
            }
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

  // Don't render if no active sessions
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Active Sessions</h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div 
            key={session.roomId} 
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Room</div>
                <div className="font-medium">{session.roomId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{session.userName}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleJoinSession(session)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                >
                  Join
                </button>
                <button
                  onClick={() => handleDeleteSession(session)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
                  title="Leave room and remove your participation"
                >
                  Leave
                </button>
              </div>
            </div>
{(() => {
              // Determine role based on isHost and isParticipant flags
              let role = null;
              let badgeStyle = '';
              
              if (session.isHost && session.isParticipant) {
                role = 'Host Participant';
                badgeStyle = 'bg-green-100 text-green-700';
              } else if (session.isHost && !session.isParticipant) {
                role = 'Facilitator';
                badgeStyle = 'bg-blue-100 text-blue-700';
              } else if (!session.isHost && session.isParticipant) {
                role = 'Participant';
                badgeStyle = 'bg-purple-100 text-purple-700';
              }
              
              return role ? (
                <div className="mt-2 text-sm">
                  <span className={`${badgeStyle} px-2 py-1 rounded-full`}>{role}</span>
                </div>
              ) : null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};

ActiveSessions.propTypes = {
  /** Callback function called when a session is deleted */
  onSessionDeleted: PropTypes.func
};

export default ActiveSessions;