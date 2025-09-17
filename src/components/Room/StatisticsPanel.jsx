import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatisticsPanel component displays voting statistics with enhanced visuals
 */
const StatisticsPanel = ({ stats, revealed, vote, votesSubmitted, totalParticipants, participants }) => {
  // Calculate actual total participants for display (including skipped)
  const actualTotalParticipants = participants ? 
    Object.values(participants).filter(p => p.isParticipant !== false).length : 
    totalParticipants;

  // Calculate additional metrics
  const votingProgress = actualTotalParticipants > 0 ? (votesSubmitted / actualTotalParticipants) * 100 : 0;
  const isVotingComplete = votesSubmitted === totalParticipants && totalParticipants > 0;
  const pendingVotes = totalParticipants - votesSubmitted;

  // Calculate detailed breakdown for revealed state
  const getDetailedCounts = () => {
    if (!participants || !revealed) {
      return { notVoted: pendingVotes, skipped: 0 };
    }

    const votingParticipants = Object.values(participants)
      .filter(p => p.isParticipant !== false); // Include all participants except facilitators
    
    const skipped = votingParticipants.filter(p => p.vote === 'SKIP').length;
    const voted = votingParticipants.filter(p => p.vote && p.vote !== 'SKIP').length;
    const notVoted = votingParticipants.length - voted - skipped;

    return { notVoted, skipped };
  };

  const { notVoted, skipped } = getDetailedCounts();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header with progress indicator */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Statistics
        </h2>
        {!revealed && (
          <div className="flex items-center gap-2">
            <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isVotingComplete ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${votingProgress}%` }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600">
              {Math.round(votingProgress)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Votes Progress */}
        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-indigo-100 col-span-2 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isVotingComplete ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
            <h3 className="text-xs sm:text-sm font-medium text-indigo-600">
              Votes Cast
            </h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">
            {votesSubmitted}<span className="text-lg text-gray-500">/{actualTotalParticipants}</span>
          </div>
          {revealed ? (
            // After reveal: Show breakdown of not voted and skipped
            <div className="text-xs mt-1 space-y-0.5">
              {notVoted > 0 && (
                <div className="text-red-600">
                  {notVoted} not voted
                </div>
              )}
              {skipped > 0 && (
                <div className="text-yellow-600">
                  {skipped} skipped
                </div>
              )}
              {notVoted === 0 && skipped === 0 && (
                <div className="text-green-600">
                  All voted
                </div>
              )}
            </div>
          ) : (
            // Before reveal: Show pending count
            pendingVotes > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                {pendingVotes} pending
              </div>
            )
          )}
        </div>

        {/* Your Vote */}
        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-purple-100 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${vote ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <h3 className="text-xs sm:text-sm font-medium text-purple-600">
              Your Vote
            </h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">
            {vote || '?'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {vote ? 'Submitted' : 'Pending'}
          </div>
        </div>
        
        {/* Average Score - Highlighted when revealed */}
        <div className={`backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center transition-all duration-500 ${
          revealed 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 shadow-lg shadow-emerald-200/50 ring-2 ring-emerald-300 ring-opacity-50' 
            : 'bg-white/80 border border-emerald-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm transition-transform duration-300 ${revealed ? 'animate-bounce' : ''}`}>
              {revealed ? '🎯' : '📊'}
            </span>
            <h3 className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
              revealed ? 'text-emerald-700 font-semibold' : 'text-emerald-600'
            }`}>
              Average
            </h3>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold transition-all duration-300 ${
            revealed ? 'text-emerald-800 transform scale-110' : 'text-gray-800'
          }`}>
            {revealed && stats.average !== null ? stats.average : '?'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {revealed ? 'Points' : 'Hidden'}
          </div>
        </div>

        {/* Min/Max Range */}
        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-amber-100 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📈</span>
            <h3 className="text-xs sm:text-sm font-medium text-amber-600">
              Range
            </h3>
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-800">
            {revealed && stats.min !== null && stats.max !== null ? 
              `${stats.min} - ${stats.max}` : '? - ?'
            }
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {revealed ? 'Min - Max' : 'Hidden'}
          </div>
        </div>

        {/* Consensus Level */}
        {revealed && stats.consensus !== undefined && (
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-teal-100 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🎯</span>
              <h3 className="text-xs sm:text-sm font-medium text-teal-600">
                Consensus
              </h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              {stats.consensus}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Agreement
            </div>
          </div>
        )}

        {/* Session Status */}
        <div className={`p-3 sm:p-4 rounded-xl shadow-sm border min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center transition-all duration-300 ${
          revealed || isVotingComplete 
            ? 'bg-green-100/90 backdrop-blur-sm border-green-300' 
            : 'bg-red-100/90 backdrop-blur-sm border-red-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{revealed ? '👁️' : isVotingComplete ? '✅' : '🔒'}</span>
            <h3 className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
              revealed || isVotingComplete ? 'text-green-700' : 'text-red-700'
            }`}>
              Status
            </h3>
          </div>
          <div className="text-sm sm:text-base font-bold text-gray-800">
            {revealed ? 'Revealed' : isVotingComplete ? 'Ready' : 'Voting'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {revealed ? 'Votes shown' : isVotingComplete ? 'All voted' : 'In progress'}
          </div>
        </div>
      </div>
    </div>
  );
};

StatisticsPanel.propTypes = {
  /** Statistics object with average, min, max, consensus */
  stats: PropTypes.shape({
    average: PropTypes.string,
    min: PropTypes.number,
    max: PropTypes.number,
    count: PropTypes.number,
    total: PropTypes.number,
    consensus: PropTypes.number
  }).isRequired,
  /** Whether votes are revealed */
  revealed: PropTypes.bool.isRequired,
  /** Current user's vote */
  vote: PropTypes.string,
  /** Number of votes submitted */
  votesSubmitted: PropTypes.number.isRequired,
  /** Total number of participants */
  totalParticipants: PropTypes.number.isRequired,
  /** Participants data for detailed breakdown */
  participants: PropTypes.object
};

export default StatisticsPanel;