import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import PropTypes from 'prop-types';
import * as StorageUtils from '../utils/localStorage';
import { validateJoinRoom, clearErrorOnInput } from '../utils/formValidation';
import { joinRoom as joinRoomUtil } from '../utils/roomOperations';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate form inputs
    const validation = validateJoinRoom(name, roomCode);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    const cleanRoomCode = validation.cleanCode;
    
    // Check if there's already an existing session for this room
    const existingSession = StorageUtils.getSessionForRoom(cleanRoomCode);
    if (existingSession) {
      // Show descriptive error message instead of popup
      setError(
        `You already have an active session in room ${cleanRoomCode} as "${existingSession.userName}". ` +
        `Please use the "Join" button in the active sessions above to resume your session, ` +
        `or click "Leave" to delete the existing session first.`
      );
      setJoining(false);
      return;
    }

    setJoining(true);
    try {
      const roomRef = ref(db, `rooms/${cleanRoomCode}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError(`Room ${cleanRoomCode} not found. Please check the code and try again.`);
        setJoining(false);
        return;
      }

      await joinRoomUtil(cleanRoomCode, name);
      navigate(`/room/${cleanRoomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(`Failed to join room: ${err.message}`);
    }
    setJoining(false);
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Planning Poker Room</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="YOUR NAME"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(clearErrorOnInput(e.target.value, error));
            }}
            required
            className={`w-full p-2 border ${error && !name.trim() ? 'border-red-500' : 'border-gray-300'} 
                rounded-lg focus:ring-2 ${error && !name.trim() ? 'focus:ring-red-500' : 'focus:ring-blue-500'} 
                focus:border-blue-500 outline-none`}
          />
          <input
            type="text"
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={(e) => {
              setRoomCode(e.target.value.toUpperCase());
              setError(clearErrorOnInput(e.target.value, error));
            }}
            maxLength={6}
            required
            className={`w-full p-2 border ${error && !roomCode.trim() ? 'border-red-500' : 'border-gray-300'} 
                rounded-lg focus:ring-2 ${error && !roomCode.trim() ? 'focus:ring-red-500' : 'focus:ring-blue-500'} 
                focus:border-blue-500 outline-none uppercase`}
          />
          <button 
            type="submit" 
            disabled={joining}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </>
  );
};

export default JoinRoom;
