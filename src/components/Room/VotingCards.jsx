import React from 'react';
import PropTypes from 'prop-types';
import { FIBONACCI_SEQUENCE } from '../../utils/constants';

/**
 * VotingCards component for the card selection interface
 */
const VotingCards = ({ vote, revealed, onVote, onSkip, onUnskip }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 flex-1 flex flex-col border border-indigo-100">
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-7">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Cast Your Vote
        </h2>
        {revealed && (
          <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-full text-sm font-medium animate-pulse border border-red-200 shadow-sm">
            Voting Closed
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-h-0">
        {/* Enhanced card-style voting layout with better alignment */}
        <div className="flex justify-center items-center flex-1 px-2 sm:px-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto justify-items-center">
            {FIBONACCI_SEQUENCE.map((value) => (
              <div key={value} className="aspect-square w-full h-full min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px] max-w-[80px] sm:max-w-[100px] md:max-w-[110px] lg:max-w-[120px] xl:max-w-[130px]">
                <button
                  onClick={() => onVote(value)}
                  disabled={revealed || vote === 'SKIP'}
                  className={`relative w-full h-full flex items-center justify-center transition-all duration-300 group ${
                    vote === value
                      ? 'z-20 transform scale-105 sm:scale-110'
                      : 'hover:z-10 hover:scale-105'
                  } ${revealed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Card background with enhanced styling */}
                  <div 
                    className={`absolute inset-0 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      vote === value 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl border-2 border-white/50 ring-2 ring-indigo-300/50'
                        : 'bg-white shadow-md hover:shadow-xl border border-indigo-100 group-hover:border-indigo-200'
                    }`}
                  />
                  
                  {/* Card corners */}
                  {vote === value && (
                    <>
                      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full shadow-sm"></div>
                      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full shadow-sm"></div>
                    </>
                  )}
                  
                  {/* Card value with enhanced styling */}
                  <span 
                    className={`relative z-10 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold transition-all duration-300 ${
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
        
        {/* Skip/Unskip button */}
        {!revealed && (
          <div className="mt-4 sm:mt-5 flex justify-center">
            {vote === 'SKIP' ? (
              <button
                onClick={onUnskip}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-200 to-emerald-200 hover:from-green-300 hover:to-emerald-300 text-green-700 rounded-full font-medium transition-all duration-200 text-sm sm:text-base flex items-center gap-2 shadow-sm hover:shadow-md border border-green-300"
              >
                <span>↩️</span>
                Unskip & Vote
              </button>
            ) : !vote && (
              <button
                onClick={onSkip}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-200 to-slate-200 hover:from-gray-300 hover:to-slate-300 text-gray-700 rounded-full font-medium transition-all duration-200 text-sm sm:text-base shadow-sm hover:shadow-md border border-gray-300"
              >
                Skip This Round
              </button>
            )}
          </div>
        )}
        
        {/* Vote status indicator */}
        <div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
          {vote === 'SKIP' ? (
            <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full font-medium flex items-center gap-2 text-sm sm:text-base border border-yellow-200 shadow-sm">
              <span>⏭️</span>
              <span>You skipped this round</span>
            </div>
          ) : vote ? (
            <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full font-medium flex items-center gap-2 text-sm sm:text-base border border-indigo-200 shadow-sm">
              <span>✅</span>
              <span>You voted: </span>
              <span className="text-lg sm:text-xl font-bold">{vote}</span>
            </div>
          ) : (
            <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-600 rounded-full font-medium animate-pulse text-sm sm:text-base">
              Select a card to vote
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VotingCards.propTypes = {
  /** Current user's vote */
  vote: PropTypes.string,
  /** Whether votes are revealed */
  revealed: PropTypes.bool.isRequired,
  /** Vote handler function */
  onVote: PropTypes.func.isRequired,
  /** Skip handler function */
  onSkip: PropTypes.func.isRequired,
  /** Unskip handler function */
  onUnskip: PropTypes.func.isRequired
};

export default VotingCards;