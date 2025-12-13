import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';

/**
 * LeaveRoomModal - Modal for hosts/facilitators to transfer role before leaving
 * Shows list of participants to transfer role to with options for Host Participant or Facilitator
 */
const LeaveRoomModal = ({
  isOpen,
  onClose,
  participants,
  sessionId,
  onTransferAndLeave,
  isTransferring = false
}) => {
  // Filter out current user and get list of other participants
  const otherParticipants = useMemo(() => {
    if (!participants) return [];
    
    return Object.entries(participants)
      .filter(([id]) => id !== sessionId)
      .map(([id, participant]) => ({
        id,
        name: participant.name || 'Unknown',
        isHost: participant.isHost || false,
        isParticipant: participant.isParticipant !== false
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [participants, sessionId]);

  // Handle transfer selection
  const handleTransfer = (participantId, participantName, canVote) => {
    onTransferAndLeave(participantId, participantName, canVote);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚪 Transfer Role Before Leaving"
      type="warning"
      size="md"
      showOk={false}
      showCancel={false}
    >
      <div className="space-y-4">
        {/* Info message */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
          <p className="text-sm sm:text-base text-amber-800 font-medium flex items-start gap-2">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <span>As the host, you must transfer your role to another participant before leaving the room.</span>
          </p>
        </div>

        {/* No other participants case */}
        {otherParticipants.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-5xl mb-3">👤</div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">No other participants in the room</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              The room will be deleted when you leave
            </p>
            <button
              onClick={() => onTransferAndLeave(null, null, false)}
              disabled={isTransferring}
              className="mt-4 px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Leaving...
                </span>
              ) : (
                'Leave & Delete Room'
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Participant selection header */}
            <div className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
              <span>👥</span>
              <span>Select who to transfer your role to:</span>
            </div>

            {/* Participants list */}
            <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
              {otherParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Participant info */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                      {(participant.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                        {participant.name}
                      </h4>
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        Participant
                      </span>
                    </div>
                  </div>

                  {/* Transfer options */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleTransfer(participant.id, participant.name, true)}
                      disabled={isTransferring}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🎯</span>
                      <span>Host Participant</span>
                    </button>
                    <button
                      onClick={() => handleTransfer(participant.id, participant.name, false)}
                      disabled={isTransferring}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>👁️</span>
                      <span>Facilitator</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading indicator */}
            {isTransferring && (
              <div className="flex items-center justify-center gap-2 py-3 text-indigo-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-medium text-sm">Transferring role and leaving...</span>
              </div>
            )}
          </>
        )}

        {/* Cancel button */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

LeaveRoomModal.propTypes = {
  /** Whether the modal is visible */
  isOpen: PropTypes.bool.isRequired,
  /** Function to close the modal */
  onClose: PropTypes.func.isRequired,
  /** Room participants object */
  participants: PropTypes.object,
  /** Current user's session ID */
  sessionId: PropTypes.string,
  /** Function to handle transfer and leave (participantId, participantName, canVote) */
  onTransferAndLeave: PropTypes.func.isRequired,
  /** Whether transfer is in progress */
  isTransferring: PropTypes.bool
};

export default LeaveRoomModal;
