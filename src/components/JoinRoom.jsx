import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/config';
import PropTypes from 'prop-types';
import Modal from './common/Modal';
import * as StorageUtils from '../utils/localStorage';
import { validateJoinRoom, clearErrorOnInput } from '../utils/formValidation';
import { joinRoom as joinRoomUtil } from '../utils/roomOperations';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setShowJoinModal(true);
    setName('');
    setRoomCode('');
    setError('');
  };

  const handleCloseModal = () => {
    if (!joining) {
      setShowJoinModal(false);
      setName('');
      setRoomCode('');
      setError('');
    }
  };

  const handleJoin = async (e) => {
    e?.preventDefault();
    
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
      setError(
        `You already have an active session in room ${cleanRoomCode} as "${existingSession.userName}". ` +
        `Please use the "Join" button in the active sessions to resume, or click "Leave" to delete the existing session first.`
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
      setShowJoinModal(false);
      navigate(`/room/${cleanRoomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(`Failed to join room: ${err.message}`);
    }
    setJoining(false);
  };

  return (
    <>
      <button 
        onClick={handleOpenModal}
        disabled={joining}
        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <span className="flex items-center justify-center gap-2">
          <span className="text-xl">🚪</span>
          Join Room
        </span>
      </button>

      <Modal 
        isOpen={showJoinModal} 
        onClose={handleCloseModal}
        title="Join Planning Poker Room"
        showCancel={true}
        showOk={true}
        okText={joining ? "Joining..." : "Join Room"}
        onOk={handleJoin}
        type="success"
        size="lg"
      >
        <form onSubmit={handleJoin} className="space-y-6">
          {/* Intro Text - VDI optimized with solid green background */}
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="text-2xl">🎯</span>
            <p className="text-sm text-gray-700 leading-relaxed">
              Join your team's Planning Poker session! Enter your name and the 6-digit room code shared by your host.
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="join-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="join-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(clearErrorOnInput(e.target.value, error));
              }}
              required
              className={`w-full px-4 py-3 border-2 ${error && !name.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'} 
                  rounded-xl focus:outline-none focus:ring-2 ${error && !name.trim() ? 'focus:ring-red-500' : 'focus:ring-green-500'} 
                  transition-colors duration-200`}
              autoFocus
            />
          </div>

          {/* Room Code Input */}
          <div>
            <label htmlFor="join-room-code" className="block text-sm font-semibold text-gray-700 mb-2">
              Room Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-green-500 text-xl">🔑</span>
              </div>
              <input
                id="join-room-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError(clearErrorOnInput(e.target.value, error));
                }}
                maxLength={6}
                required
                className={`w-full pl-12 pr-4 py-3 border-2 ${error && !roomCode.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'} 
                    rounded-xl focus:outline-none focus:ring-2 ${error && !roomCode.trim() ? 'focus:ring-red-500' : 'focus:ring-green-500'} 
                    uppercase font-mono text-lg tracking-wider transition-colors duration-200`}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">The 6-character code provided by your room host</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
};

export default JoinRoom;
