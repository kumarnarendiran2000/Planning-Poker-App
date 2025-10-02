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
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [emailValidationError, setEmailValidationError] = useState('');

  // Email validation helper
  const validateEmail = (email) => {
    if (!email.trim()) {
      return { isValid: false, error: 'Email address is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: '' };
  };

  const handleCreateRoom = () => {
    setShowNameModal(true);
  };

  const handleModalClose = () => {
    if (!creatingRoom) {
      setShowNameModal(false);
      setHostName('');
      setParticipateInVoting(true); // Reset to default
      setEmailNotifications(false);
      setUserEmail('');
      setError(''); // Clear any errors when modal is closed
      setEmailValidationError(''); // Clear email validation errors
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
    
    // Validate email if notifications are enabled
    if (emailNotifications) {
      const emailValidation = validateEmail(userEmail);
      if (!emailValidation.isValid) {
        setError(emailValidation.error);
        setEmailValidationError(emailValidation.error);
        return;
      }
    }
    
    // Clear any previous errors
    setError('');

    setCreatingRoom(true);
    
    try {
      const emailConfig = emailNotifications ? {
        enabled: true,
        userEmail: userEmail.trim(),
        adminEmail: 'kumarnarendiran2000@gmail.com'
      } : {
        enabled: false,
        adminEmail: 'kumarnarendiran2000@gmail.com' // Admin always gets notified
      };
      
      const { roomCode } = await createRoom(hostName, participateInVoting, emailConfig);
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

          {/* Email Notifications */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-3">
              📧 Email Notifications
            </label>
            <div className="space-y-4">
              {/* Checkbox with improved alignment and visual feedback */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                emailNotifications 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={emailNotifications}
                  onChange={(e) => {
                    setEmailNotifications(e.target.checked);
                    if (!e.target.checked) {
                      setUserEmail(''); // Clear email when unchecked
                      setError(''); // Clear any email-related errors
                      setEmailValidationError(''); // Clear email validation errors
                    }
                  }}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="emailNotifications" className="flex-1 cursor-pointer">
                  <div className={`font-medium ${emailNotifications ? 'text-blue-900' : 'text-gray-900'}`}>
                    Get email updates {emailNotifications && <span className="text-green-500">✓</span>}
                  </div>
                  <div className={`text-sm ${emailNotifications ? 'text-blue-700' : 'text-gray-600'}`}>
                    Receive notifications for room events (participant joins, leaves, room deletion, etc.)
                  </div>
                </label>
              </div>
              
              {/* Email input with better styling and validation */}
              {emailNotifications && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label htmlFor="userEmail" className="block text-sm font-medium text-blue-900 mb-2">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    value={userEmail}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setUserEmail(newEmail);
                      
                      // Real-time validation
                      if (newEmail.trim()) {
                        const validation = validateEmail(newEmail);
                        setEmailValidationError(validation.isValid ? '' : validation.error);
                      } else {
                        setEmailValidationError('');
                      }
                      
                      // Clear general errors when user starts typing
                      if (error && (error.includes('email') || error.includes('Email'))) {
                        setError('');
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur if field has content
                      if (userEmail.trim()) {
                        const validation = validateEmail(userEmail);
                        setEmailValidationError(validation.isValid ? '' : validation.error);
                      }
                    }}
                    placeholder="your-email@example.com"
                    required={emailNotifications}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
                      emailValidationError || (error && (error.includes('email') || error.includes('Email')))
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : userEmail.trim() && !emailValidationError
                        ? 'border-green-300 focus:ring-green-500 bg-green-50'
                        : 'border-blue-300 focus:ring-blue-500 bg-white'
                    }`}
                  />
                  
                  {/* Email validation feedback */}
                  {emailValidationError && (
                    <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <span>❌</span>
                      {emailValidationError}
                    </div>
                  )}
                  
                  {userEmail.trim() && !emailValidationError && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✅</span>
                      Valid email address
                    </div>
                  )}
                </div>
              )}
              

            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

// No PropTypes needed as this component doesn't accept any props

export default CreateRoom;
