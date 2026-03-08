import React from 'react';
import { useNavigate } from 'react-router-dom';
import VotingCards from './VotingCards';
import HostControls from './HostControls';

/**
 * Main voting area component
 * Contains the voting cards and host controls
 */
const RoomVotingArea = ({
  roomId,
  vote,
  revealed,
  onVote,
  onSkip,
  onUnskip,
  isHost,
  isParticipant = true,
  onReveal,
  onReset,
  onDelete,
  onLeaveRoom,
}) => {
  const navigate = useNavigate();

  const HistoryButton = () => (
    <button
      onClick={() => navigate(`/room/${roomId}/history`)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-md hover:shadow-lg ring-2 ring-violet-300 hover:ring-violet-400 transition-all duration-150"
      title="View voting history for this room"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span>Round History</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col">
      {isParticipant ? (
        <div className="flex-1 flex flex-col">
          {/* Role info banner */}
          <div className="rounded-xl shadow-lg p-4 sm:p-6 mb-4 flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{isHost ? '👑' : '🗳️'}</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {isHost ? 'Host & Participant' : 'Participant'}
                  </h3>
                  <p className="text-sm text-green-600">
                    {isHost
                      ? 'You can vote and manage the session'
                      : 'Cast your vote using the cards below'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HistoryButton />
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  {isHost ? 'Host Participant' : 'Voter'}
                </span>
              </div>
            </div>
          </div>

          {/* Voting Cards */}
          <VotingCards
            vote={vote}
            revealed={revealed}
            onVote={onVote}
            onSkip={onSkip}
            onUnskip={onUnskip}
            onLeaveRoom={onLeaveRoom}
          />
        </div>
      ) : (
        /* Facilitator view */
        <div className="flex-1 flex flex-col">
          {/* Facilitator info banner */}
          <div className="rounded-xl shadow-lg p-4 sm:p-6 mb-4 flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👨‍💼</div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Facilitator</h3>
                  <p className="text-sm text-orange-600">You manage the session without voting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HistoryButton />
                {onLeaveRoom && (
                  <button
                    onClick={onLeaveRoom}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-full shadow-sm transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Leave Room
                  </button>
                )}
                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                  Observer
                </span>
              </div>
            </div>
          </div>

          {/* Disabled voting cards */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 flex-1 flex flex-col opacity-60">
            <div className="mb-4 sm:mb-7">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-600">Cast Your Vote</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <div className="flex justify-center items-center flex-1 px-2 sm:px-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto justify-items-center">
                  {['1', '2', '3', '5', '8', '13', '21', '?'].map((value) => (
                    <div key={value} className="aspect-square w-full h-full min-h-[50px] sm:min-h-[70px] md:min-h-[80px] lg:min-h-[90px] xl:min-h-[100px] max-w-[100px] sm:max-w-[120px] lg:max-w-[130px] xl:max-w-[140px]">
                      <div className="relative w-full h-full flex items-center justify-center cursor-not-allowed">
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gray-200 shadow-sm border border-gray-300" />
                        <span className="relative z-10 text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-400">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-center">
                <div className="px-4 py-2 sm:px-6 sm:py-3 bg-orange-100 text-orange-700 rounded-full font-medium text-sm sm:text-base">
                  Voting disabled as facilitator — use controls below to manage session
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
