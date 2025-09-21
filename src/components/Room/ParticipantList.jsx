import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ParticipantList.module.css';

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
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Check if data is still loading
  const isLoading = !participants || Object.keys(participants).length === 0 || !sessionId;
  
  // Memoize participant list to prevent unnecessary re-renders
  const sortedParticipants = useMemo(() => {
    if (isLoading) return [];
    
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
  }, [participants, sessionId, isLoading]);
  
  // Filter participants based on active filter
  const filteredParticipants = useMemo(() => {
    if (activeFilter === 'all') return sortedParticipants;
    
    return sortedParticipants.filter(participant => {
      // Facilitators don't vote, so they should only appear in 'all'
      if (participant.isParticipant === false) {
        return false;
      }
      
      switch (activeFilter) {
        case 'voted':
          return participant.vote && participant.vote !== 'SKIP' && participant.vote !== null && participant.vote !== '';
        case 'not-voted':
          return !participant.vote || participant.vote === null || participant.vote === '';
        case 'skipped':
          return participant.vote === 'SKIP';
        default:
          return true;
      }
    });
  }, [sortedParticipants, activeFilter]);
  
  // Calculate filter counts
  const filterCounts = useMemo(() => {
    if (isLoading) return { all: 0, voted: 0, 'not-voted': 0, skipped: 0 };
    
    const counts = { all: sortedParticipants.length, voted: 0, 'not-voted': 0, skipped: 0 };
    
    sortedParticipants.forEach(participant => {
      // Skip facilitators for vote counts
      if (participant.isParticipant === false) return;
      
      if (participant.vote === 'SKIP') {
        counts.skipped++;
      } else if (participant.vote && participant.vote !== null && participant.vote !== '') {
        counts.voted++;
      } else {
        counts['not-voted']++;
      }
    });
    
    return counts;
  }, [sortedParticipants, isLoading]);
  
  // Calculate participant breakdown
  const getParticipantBreakdown = () => {
    if (isLoading) {
      return {
        totalCount: 0,
        regularParticipants: 0,
        facilitators: 0,
        hostParticipants: 0,
        votingStrength: 0
      };
    }
    
    const totalCount = Object.keys(participants).length;
    
    // Count different types of participants
    const regularParticipants = Object.values(participants).filter(p => 
      !p.isHost && p.isParticipant !== false
    ).length;
    
    const facilitators = Object.values(participants).filter(p => 
      p.isHost && p.isParticipant === false
    ).length;
    
    const hostParticipants = Object.values(participants).filter(p => 
      p.isHost && p.isParticipant !== false
    ).length;
    
    const votingStrength = totalCount - facilitators; // Everyone except facilitators can vote
    
    return {
      totalCount,
      regularParticipants,
      facilitators,
      hostParticipants,
      votingStrength
    };
  };

  const { totalCount, regularParticipants, facilitators, hostParticipants, votingStrength } = getParticipantBreakdown();

  // Create display text for the breakdown
  const getBreakdownText = () => {
    if (isLoading) {
      return (
        <div className="text-center leading-tight">
          <div className="text-xs font-medium text-gray-400">
            Loading...
          </div>
        </div>
      );
    }
    
    if (facilitators > 0) {
      // Facilitator session
      return (
        <div className="text-center leading-tight">
          <div className="text-xs font-medium">
            {regularParticipants + hostParticipants} participants, {facilitators} facilitator
          </div>
          <div className="text-xs text-purple-700">
            {totalCount} total, {votingStrength} voting
          </div>
        </div>
      );
    } else {
      // All participants session (including host participants)
      return (
        <div className="text-center leading-tight">
          <div className="text-xs font-medium">
            {regularParticipants} participants{hostParticipants > 0 ? `, ${hostParticipants} host participant` : ''}
          </div>
          <div className="text-xs text-purple-700">
            {totalCount} total, {votingStrength} voting
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`w-full flex flex-col h-full min-h-[400px] ${styles.participantContainer}`}>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-lg p-2 sm:p-3 lg:p-4 xl:p-5 2xl:p-6 flex-1 flex flex-col min-w-0 border border-indigo-100 h-full min-h-[400px]">
        <div className="flex items-center justify-between mb-2 sm:mb-3 xl:mb-4 2xl:mb-5 flex-shrink-0 min-h-[40px]">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 flex-shrink-0">
            Participants
          </h2>
          <div className="px-2 py-1 sm:px-3 sm:py-1.5 xl:px-4 xl:py-2 2xl:px-5 2xl:py-2.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200 min-w-[120px] xl:min-w-[140px] 2xl:min-w-[160px] text-center flex-shrink-0 text-xs xl:text-sm 2xl:text-base">
            {getBreakdownText()}
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {['all', 'voted', 'not-voted', 'skipped'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-colors ${
                  activeFilter === filter
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {filter === 'all' ? 'All' : 
                 filter === 'voted' ? 'Voted' : 
                 filter === 'not-voted' ? 'Not Voted' : 
                 'Skipped'} ({filterCounts[filter]})
              </button>
            ))}
          </div>
        </div>
        
        <div className={`relative flex-1 min-w-0 min-h-[300px] xl:min-h-[360px] 2xl:min-h-[420px] will-change-scroll ${styles.scrollableArea}`}>
          <div className="space-y-1.5 sm:space-y-2 xl:space-y-2.5 2xl:space-y-3 h-full overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 xl:pr-3 2xl:pr-4 scroll-smooth absolute inset-0 contain-layout">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-300"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredParticipants.length === 0 ? (
              // Empty state when no participants match the filter
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  No participants match the "{activeFilter === 'not-voted' ? 'Not Voted' : activeFilter === 'voted' ? 'Voted' : 'Skipped'}" filter
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try selecting a different filter
                </p>
              </div>
            ) : (
              filteredParticipants.map((participant, index) => (
              <div
                key={participant.id}
                className={`group bg-white/95 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow-sm border will-change-transform ${styles.participantCard}
                  ${participant.isCurrentUser 
                    ? 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent' 
                    : 'border-gray-200'
                  }
                  ${participant.vote === 'voted' 
                    ? 'shadow-lg border-green-300 bg-gradient-to-br from-green-50/40 to-emerald-50/30' 
                    : ''
                  }`}
                style={{ minHeight: '80px' }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="relative flex-shrink-0">
                    {/* Enhanced avatar with better gradients */}
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white ${
                      participant.isCurrentUser 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                    } ${
                      participant.vote === 'voted' 
                        ? 'ring-1 ring-green-400/30' 
                        : ''
                    }`}>
                      {(participant.name || '?').charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Ready badge for voted participants */}
                    {participant.vote === 'voted' && (
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between min-w-0 mb-1">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base min-w-0">
                          {participant.name || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-1 flex-wrap min-w-0">
                          {participant.isHost && participant.isParticipant !== false && (
                            <span className="text-xs sm:text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap border border-green-200">Host Participant</span>
                          )}
                          {participant.isHost && participant.isParticipant === false && (
                            <span className="text-xs sm:text-sm bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap border border-orange-200">Facilitator</span>
                          )}
                          {!participant.isHost && (
                            <span className="text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap border border-purple-200">Participant</span>
                          )}
                          {participant.isCurrentUser && (
                            <span className="text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap border border-blue-200">You</span>
                          )}
                          
                          {/* Ready status indicator */}
                          {participant.vote === 'voted' && (
                            <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 whitespace-nowrap border border-green-200 shadow-sm">
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
                          className="text-red-400 hover:text-red-600 p-1.5 sm:p-2 rounded-full hover:bg-red-50 flex-shrink-0"
                          title="Remove participant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-1 sm:mt-1.5 flex items-center">
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
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shadow-lg">
                                {participant.vote}
                              </div>
                            </div>
                          ) : (
                            // Enhanced "voted" state before reveal
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-xs sm:text-sm">✓</span>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-2 py-1 sm:px-3 sm:py-1 rounded-full">
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
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
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
              ))
            )}
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