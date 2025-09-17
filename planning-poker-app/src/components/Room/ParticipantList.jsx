import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * ParticipantList component displays all participants in the room
 */
const ParticipantList = ({ 
  participants, 
  sessionId, 
  revealed, 
  isHost = false, 
  onRemoveParticipant 
}) => {
  
  // Memoize participant list to prevent unnecessary re-renders
  const sortedParticipants = useMemo(() => {
    // Convert participants object to array for sorting
    const participantsArray = Object.entries(participants)
      .map(([id, participant]) => {
        return {
          id,
          ...participant,
          // Mark current user and host for sorting priority
          isCurrentUser: id === sessionId,
          isHost: participant.isHost || false,
          // Determine if participant is a facilitator
          isFacilitator: participant.isHost && participant.isParticipant === false
        };
      });
    
    // Enhanced sorting logic: Current user first, then by role, then by name
    return participantsArray.sort((a, b) => {
        // 1. Current user always first
        if (a.isCurrentUser !== b.isCurrentUser) return a.isCurrentUser ? -1 : 1;
        
        // 2. Sort by role priority: Facilitator > Host > Participant
        const getRolePriority = (participant) => {
          if (participant.isFacilitator) return 1; // Highest priority
          if (participant.isHost) return 2;
          return 3; // Regular participants
        };
        
        const priorityA = getRolePriority(a);
        const priorityB = getRolePriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        
        // 3. Finally sort by name
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [participants, sessionId]);
  
  // Count total participants
  const totalParticipants = Object.keys(participants).length;

  return (
    <div className="w-full lg:w-[350px] xl:w-[400px] 2xl:w-[450px] flex flex-col">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Participants
          </h2>
          <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
            {totalParticipants} total
          </span>
        </div>
        
        <div className="relative flex-1 min-w-0">
          <div className="space-y-2 sm:space-y-3 h-full overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 scroll-smooth lg:max-h-[calc(100vh-24rem)]">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className={`group bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border transition-all duration-500 
                  ${participant.isCurrentUser 
                    ? 'border-l-4 border-l-purple-500 bg-purple-50/30' 
                    : 'border-gray-200'
                  }
                  ${participant.vote === 'voted' 
                    ? 'shadow-green-200/50 shadow-lg border-green-300 bg-gradient-to-br from-green-50/30 to-emerald-50/20 animate-pulse transform scale-[0.98] brightness-95' 
                    : ''
                  }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    {/* Enhanced avatar with better gradients */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 ${
                      participant.isCurrentUser 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                    } ${
                      participant.vote === 'voted' 
                        ? 'animate-bounce shadow-green-400/50' 
                        : ''
                    }`}>
                      {(participant.name || '?').charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Ready badge for voted participants */}
                    {participant.vote === 'voted' && (
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0">
                        <h3 className="font-medium text-gray-800 truncate text-sm sm:text-base">
                          {participant.name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-1 flex-wrap">
                          {participant.isHost && participant.isParticipant !== false && (
                            <span className="text-xs sm:text-sm bg-green-100 text-green-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap">Host Participant</span>
                          )}
                          {participant.isHost && participant.isParticipant === false && (
                            <span className="text-xs sm:text-sm bg-orange-100 text-orange-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap">Facilitator</span>
                          )}
                          {!participant.isHost && (
                            <span className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap">Participant</span>
                          )}
                          {participant.isCurrentUser && (
                            <span className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap">You</span>
                          )}
                          {/* Ready status indicator */}
                          {participant.vote === 'voted' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse flex items-center gap-1 whitespace-nowrap">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Ready
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced host controls for removing participants */}
                      {isHost && !participant.isCurrentUser && !participant.isHost && onRemoveParticipant && (
                        <button 
                          onClick={() => onRemoveParticipant(participant.id, participant.name)}
                          className="text-red-400 hover:text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-all duration-200 flex-shrink-0"
                          title="Remove participant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-1.5 sm:mt-2 flex items-center">
                      {participant.vote === 'SKIP' ? (
                        // Skipped state - matches observing design but different color
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-xs sm:text-sm">⏭️</span>
                          </div>
                          <span className="text-xs sm:text-sm text-yellow-700 bg-yellow-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                            Skipped
                          </span>
                        </div>
                      ) : participant.vote ? (
                        <div className="flex items-center gap-3">
                          {revealed ? (
                            // Enhanced vote display when revealed
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg transform transition-all duration-300 hover:scale-110">
                                {participant.vote}
                              </div>
                            </div>
                          ) : (
                            // Enhanced "voted" state before reveal
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-xs sm:text-sm">✓</span>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full animate-pulse">
                                Vote Casted
                              </span>
                            </div>
                          )}
                        </div>
                      ) : participant.isParticipant === false ? (
                        // Facilitator status - no voting
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-xs sm:text-sm">👁️</span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                            Observing
                          </span>
                        </div>
                      ) : revealed ? (
                        // Not voted state when votes are revealed
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-xs sm:text-sm">✗</span>
                          </div>
                          <span className="text-xs sm:text-sm text-red-700 bg-red-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                            Not Voted
                          </span>
                        </div>
                      ) : (
                        // Enhanced "deciding" state for actual participants
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center shadow-md">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping"></div>
                          </div>
                          <span className="text-xs sm:text-sm text-amber-700 bg-amber-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                            Deciding...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ParticipantList.propTypes = {
  /** Room participants object */
  participants: PropTypes.object.isRequired,
  /** Current user's session ID */
  sessionId: PropTypes.string.isRequired,
  /** Whether votes are revealed */
  revealed: PropTypes.bool.isRequired,
  /** Whether the current user is the host */
  isHost: PropTypes.bool,
  /** Function to remove a participant (host only) */
  onRemoveParticipant: PropTypes.func
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ParticipantList);