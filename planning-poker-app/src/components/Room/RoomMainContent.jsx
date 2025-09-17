import React from 'react';
import ParticipantList from './ParticipantList';
import StatisticsPanel from './StatisticsPanel';
import RoomVotingArea from './RoomVotingArea';
import { isUserParticipant } from '../../utils/localStorage';

/**
 * Main content area of the room
 * Contains participants list, statistics, and voting area
 */
const RoomMainContent = ({ 
  participants,
  sessionId,
  roomId,
  revealed,
  isHost,
  onRemoveParticipant,
  stats,
  vote,
  votesSubmitted,
  totalParticipants,
  onVote,
  onSkip,
  onUnskip,
  onReveal,
  onReset,
  onDelete
}) => {
  // Check if current user participates in voting
  // Use localStorage first (immediate), then Firebase data (when loaded)
  const currentUser = participants[sessionId];
  const isParticipantFromFirebase = currentUser?.isParticipant !== false;
  const isParticipantFromStorage = isUserParticipant(roomId);
  
  // Use Firebase data if available, otherwise fall back to localStorage
  const isParticipant = currentUser ? isParticipantFromFirebase : isParticipantFromStorage;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-6">
      {/* Participants List */}
      <ParticipantList 
        participants={participants}
        sessionId={sessionId}
        revealed={revealed}
        isHost={isHost}
        onRemoveParticipant={onRemoveParticipant}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-6 min-w-0">
        {/* Statistics Panel */}
        <div className="flex-shrink-0">
          <StatisticsPanel 
            stats={stats}
            revealed={revealed}
            vote={vote}
            votesSubmitted={votesSubmitted}
            totalParticipants={totalParticipants}
            participants={participants}
          />
        </div>
        
        {/* Voting Area */}
        <div className="lg:flex-1 lg:min-h-0">
          <RoomVotingArea
            vote={vote}
            revealed={revealed}
            onVote={onVote}
            onSkip={onSkip}
            onUnskip={onUnskip}
            isHost={isHost}
            isParticipant={isParticipant}
            onReveal={onReveal}
            onReset={onReset}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomMainContent;