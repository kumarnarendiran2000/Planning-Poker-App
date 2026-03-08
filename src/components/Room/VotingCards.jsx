import React from 'react';
import PropTypes from 'prop-types';
import { FIBONACCI_SEQUENCE } from '../../utils/constants';

/**
 * VotingCards component for the card selection interface
 */
const VotingCards = ({ vote, revealed, onVote, onSkip, onUnskip, onLeaveRoom }) => {
  return (
    <div className="bg-blue-50 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex-1 flex flex-col border border-blue-200">
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-7">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Cast Your Vote
        </h2>
        {revealed && (
          <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full text-sm font-medium border border-red-200 shadow-sm">
            Voting Closed
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-0">
        {/* Hint: click selected card to unvote */}
        {vote && vote !== 'SKIP' && !revealed && (
          <p className="text-center text-[10px] text-gray-400 mb-1 tracking-wide">
            Tap your selected card again to remove your vote
          </p>
        )}

        {/* Card grid */}
        <div className="flex justify-center items-center flex-1 px-2 sm:px-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto justify-items-center">
            {FIBONACCI_SEQUENCE.map((value) => (
              <div key={value} className="aspect-square w-full h-full min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px] max-w-[80px] sm:max-w-[100px] md:max-w-[110px] lg:max-w-[120px] xl:max-w-[130px]">
                <button
                  onClick={() => onVote(value)}
                  disabled={revealed || vote === 'SKIP'}
                  className={`relative w-full h-full flex items-center justify-center group ${
                    vote === value ? 'z-20' : 'hover:z-10'
                  } ${revealed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div
                    className={`absolute inset-0 rounded-lg sm:rounded-xl ${
                      vote === value
                        ? 'bg-blue-600 shadow-md border-2 border-blue-800'
                        : 'bg-white shadow-sm hover:shadow-md border border-blue-200 hover:border-blue-300'
                    }`}
                  />
                  {vote === value && (
                    <>
                      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full shadow-sm"></div>
                      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full shadow-sm"></div>
                    </>
                  )}
                  <span
                    className={`relative z-10 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold ${
                      vote === value ? 'text-white' : 'text-indigo-600 group-hover:text-indigo-700'
                    }`}
                  >
                    {value}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vote status indicator */}
        {(() => {
          if (vote === 'SKIP') {
            return (
              <div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
                <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full font-medium flex items-center gap-2 text-sm sm:text-base border border-yellow-200 shadow-sm">
                  <span>⏭️</span>
                  <span>You skipped this round</span>
                </div>
              </div>
            );
          }
          if (vote) {
            return (
              <div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
                <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full font-medium flex items-center gap-2 text-sm sm:text-base border border-indigo-200 shadow-sm">
                  <span>✅</span>
                  <span>You voted:</span>
                  <span className="text-lg sm:text-xl font-bold">{vote}</span>
                </div>
              </div>
            );
          }
          return (
            <div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
              <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-600 rounded-full font-medium text-sm sm:text-base">
                Select a card to vote
              </div>
            </div>
          );
        })()}

        {/* Bottom action row: Skip/Unskip  +  Leave Room side by side */}
        <div className="mt-3 sm:mt-4 flex justify-center items-center gap-3 flex-wrap">
          {!revealed && vote === 'SKIP' && (
            <button
              onClick={onUnskip}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-green-200 hover:bg-green-300 text-green-700 rounded-lg font-medium text-sm sm:text-base flex items-center gap-2 shadow-sm border border-green-300 transition-colors"
            >
              <span>↩️ Unskip &amp; Vote</span>
            </button>
          )}
          {!revealed && vote !== 'SKIP' && (
            <button
              onClick={onSkip}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-900 rounded-lg font-semibold text-sm sm:text-base shadow-sm border border-amber-500 ring-1 ring-amber-300 transition-all"
            >
              ⏩ Skip This Round
            </button>
          )}

          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm sm:text-base flex items-center gap-1.5 shadow-sm border border-red-400 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

VotingCards.propTypes = {
  vote: PropTypes.string,
  revealed: PropTypes.bool.isRequired,
  onVote: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  onUnskip: PropTypes.func.isRequired,
  onLeaveRoom: PropTypes.func,
};

export default VotingCards;
