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
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 xl:gap-8 2xl:gap-10 min-h-[600px] flex-1">
      {/* Participants List - Responsive width for large screens */}
      <div className="lg:flex-shrink-0 flex flex-col min-h-[400px] lg:min-h-[600px] lg:w-80 xl:w-96 2xl:w-[28rem]">
        <ParticipantList 
          participants={participants}
          sessionId={sessionId}
          revealed={revealed}
          isHost={isHost}
          onRemoveParticipant={onRemoveParticipant}
        />
      </div>

      {/* Main Content Area - Full height with proper distribution */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-8 2xl:gap-10 min-w-0 min-h-[600px]">
        {/* Statistics Panel */}
        <div className="flex-shrink-0 min-h-[200px] xl:min-h-[240px] 2xl:min-h-[280px]">
          <StatisticsPanel 
            stats={stats}
            revealed={revealed}
            vote={vote}
            votesSubmitted={votesSubmitted}
            totalParticipants={totalParticipants}
            participants={participants}
          />
        </div>
        
        {/* Voting Area - Takes remaining space */}
        <div className="flex-1 min-h-[300px] xl:min-h-[360px] 2xl:min-h-[420px]">
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