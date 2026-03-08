import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './common/Modal';
import { validateCreateRoom, clearErrorOnInput } from '../utils/formValidation';
import { createRoom } from '../utils/roomOperations';

function CreateRoom() {
  const navigate = useNavigate();
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [hostName, setHostName] = useState('');
  const [participateInVoting, setParticipateInVoting] = useState(true);
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    setShowNameModal(true);
  };

  const handleModalClose = () => {
    if (!creatingRoom) {
      setShowNameModal(false);
      setHostName('');
      setParticipateInVoting(true);
      setError('');
    }
  };

  const handleCreateRoomConfirm = async (e) => {
    e?.preventDefault();

    const validation = validateCreateRoom(hostName);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setError('');
    setCreatingRoom(true);

    try {
      const { roomCode } = await createRoom(hostName, participateInVoting, null);
      setShowNameModal(false);
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(`Failed to create room: ${err.message}`);
    }
    setCreatingRoom(false);
  };

  return (
    <>
      <button
        onClick={handleCreateRoom}
        disabled={creatingRoom}
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {creatingRoom ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Room...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            Create Room
          </span>
        )}
      </button>

      <Modal
        isOpen={showNameModal}
        onClose={handleModalClose}
        title="Create Planning Poker Room"
        showCancel={true}
        showOk={true}
        okText={creatingRoom ? "Creating..." : "Create Room"}
        onOk={handleCreateRoomConfirm}
        type="create"
        size="lg"
      >
        <form onSubmit={handleCreateRoomConfirm} className="space-y-6">
          {/* Intro Text with Icon */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <span className="text-2xl">✨</span>
            <p className="text-sm text-gray-700 leading-relaxed">
              Set up your Planning Poker session in seconds. Choose your role and start collaborating with your team!
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="hostName" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="hostName"
              value={hostName}
              onChange={(e) => {
                setHostName(e.target.value);
                setError(clearErrorOnInput(e.target.value, error));
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateRoomConfirm(e);
                }
              }}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 border-2 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}
                rounded-xl focus:outline-none focus:ring-2
                ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
                transition-all duration-200`}
              autoFocus
            />
            {error && (
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              </div>
            )}
          </div>

          {/* Participation Option */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose Your Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex flex-col cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                participateInVoting
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="participation"
                    checked={participateInVoting}
                    onChange={() => setParticipateInVoting(true)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👑</span>
                    <div className="font-semibold text-gray-900">Host Participant</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 ml-8">
                  Create room and participate in voting estimates
                </div>
              </label>

              <label className={`flex flex-col cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                !participateInVoting
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="radio"
                    name="participation"
                    checked={!participateInVoting}
                    onChange={() => setParticipateInVoting(false)}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <div className="font-semibold text-gray-900">Facilitator</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 ml-8">
                  Create and manage room without voting (observer mode)
                </div>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CreateRoom;
