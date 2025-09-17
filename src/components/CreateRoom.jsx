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
      setParticipateInVoting(true); // Reset to default
      setError(''); // Clear any errors when modal is closed
    }
  };

  const handleCreateRoomConfirm = async (e) => {
    e?.preventDefault(); // Handle both button click and form submit
    
    // Validate form input
    const validation = validateCreateRoom(hostName);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    // Clear any previous errors
    setError('');

    setCreatingRoom(true);
    
    try {
      const { roomCode } = await createRoom(hostName, participateInVoting);
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Planning Poker Room</h2>
        <button 
          onClick={handleCreateRoom}
          disabled={creatingRoom}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {creatingRoom ? 'Creating...' : 'Create Room'}
        </button>
      </div>

      <Modal 
        isOpen={showNameModal} 
        onClose={handleModalClose}
        title="Create Planning Poker Room"
        showCancel={true}
        showOk={true}
        okText={creatingRoom ? "Creating..." : "Create Room"}
        onOk={handleCreateRoomConfirm}
        type="default"
      >
        <form onSubmit={handleCreateRoomConfirm} className="py-2">
          <p className="text-gray-600 mb-4">
            Enter your name and choose your role in the Planning Poker session.
          </p>
          <div className="mb-4">
            <label htmlFor="hostName" className="block text-gray-700 font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="hostName"
              value={hostName}
              onChange={(e) => {
                setHostName(e.target.value);
                // Clear error when user starts typing
                setError(clearErrorOnInput(e.target.value, error));
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateRoomConfirm(e);
                }
              }}
              placeholder="Enter your name"
              className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} 
                rounded-lg focus:outline-none focus:ring-2 
                ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          
          {/* Participation Option */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-3">
              Your Role
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="participation"
                  checked={participateInVoting}
                  onChange={() => setParticipateInVoting(true)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Participating Host</div>
                  <div className="text-sm text-gray-600">Create room and participate in voting estimates</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="participation"
                  checked={!participateInVoting}
                  onChange={() => setParticipateInVoting(false)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Facilitator Only</div>
                  <div className="text-sm text-gray-600">Create and manage room without voting (observer mode)</div>
                </div>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

// No PropTypes needed as this component doesn't accept any props

export default CreateRoom;
