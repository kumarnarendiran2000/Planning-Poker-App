import React from 'react';
import VotingCards from './VotingCards';
import HostControls from './HostControls';

/**
 * Main voting area component
 * Contains the voting cards and host controls
 */
const RoomVotingArea = ({ 
  vote, 
  revealed, 
  onVote,
  onSkip,
  onUnskip, 
  isHost, 
  isParticipant = true,
  onReveal, 
  onReset, 
  onDelete 
}) => {
  // Determine the user's role for display
  const getUserRole = () => {
    if (isHost && !isParticipant) return 'facilitator';
    if (isHost && isParticipant) return 'host';
    return 'participant';
  };

  const role = getUserRole();

  return (
    <div className="flex-1 flex flex-col">
      {isParticipant ? (
        <div className="flex-1 flex flex-col">
          {/* Informational header for participants and participating hosts */}
          <div className={`rounded-xl shadow-lg p-4 sm:p-6 mb-4 flex-shrink-0 ${
            isHost 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {isHost ? '👑' : '🗳️'}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isHost ? 'text-green-800' : 'text-green-800'
                  }`}>
                    {isHost ? 'Host & Participant' : 'Participant'}
                  </h3>
                  <p className={`text-sm ${
                    isHost ? 'text-green-600' : 'text-green-600'
                  }`}>
                    {isHost 
                      ? 'You can vote and manage the session'
                      : 'Cast your vote using the cards below'
                    }
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                isHost 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {isHost ? 'Host Participant' : 'Voter'}
              </span>
            </div>
          </div>

          {/* Voting Cards */}
          <VotingCards 
            vote={vote}
            revealed={revealed}
            onVote={onVote}
            onSkip={onSkip}
            onUnskip={onUnskip}
          />
        </div>
      ) : (
        // Facilitator view - disabled voting cards similar to participant view
        <div className="flex-1 flex flex-col">
          {/* Informational header for facilitator */}
          <div className="rounded-xl shadow-lg p-4 sm:p-6 mb-4 flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👨‍💼</div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">
                    Facilitator
                  </h3>
                  <p className="text-sm text-orange-600">
                    You manage the session without voting
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                Observer
              </span>
            </div>
          </div>

          {/* Disabled Voting Cards */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex-1 flex flex-col opacity-60">
            <div className="mb-4 sm:mb-7">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-600">
                Cast Your Vote
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col justify-center min-h-0">
              {/* Disabled card-style voting layout */}
              <div className="flex justify-center items-center flex-1 px-2 sm:px-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto justify-items-center">
                  {['1', '2', '3', '5', '8', '13', '21', '?'].map((value) => (
                    <div key={value} className="aspect-square w-full h-full min-h-[50px] sm:min-h-[70px] md:min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px]">
                      <div className="relative w-full h-full flex items-center justify-center cursor-not-allowed">
                        {/* Disabled card background */}
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gray-200 shadow-sm border border-gray-300" />
                        
                        {/* Card value */}
                        <span className="relative z-10 text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-400">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Facilitator status indicator */}
              <div className="mt-4 sm:mt-6 flex justify-center">
                <div className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-100 text-orange-700 rounded-full font-medium text-sm sm:text-base">
                  Voting disabled as facilitator - use controls below to manage session
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Host Controls */}
      {isHost && (
        <div className="flex-shrink-0">
          <HostControls 
            revealed={revealed}
            onReveal={onReveal}
            onReset={onReset}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
};

export default RoomVotingArea;