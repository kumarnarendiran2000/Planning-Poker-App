import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatisticsPanel component displays voting statistics with enhanced visuals
 */
const StatisticsPanel = ({ stats, revealed, vote, votesSubmitted, totalParticipants, participants }) => {
  // Calculate proper participant counts
  const getParticipantCounts = () => {
    if (!participants) {
      return {
        totalEligible: totalParticipants,
        actualVoted: votesSubmitted,
        skipped: 0,
        notVoted: totalParticipants - votesSubmitted,
        votesWithSkipped: votesSubmitted
      };
    }

    // Get all participants except facilitators (isParticipant === false)
    // Include participant hosts but exclude pure facilitators
    const eligibleParticipants = Object.values(participants)
      .filter(p => p.isParticipant !== false);
    
    const totalEligible = eligibleParticipants.length;
    const actualVoted = eligibleParticipants.filter(p => p.vote && p.vote !== 'SKIP').length;
    const skipped = eligibleParticipants.filter(p => p.vote === 'SKIP').length;
    const notVoted = totalEligible - actualVoted - skipped;
    
    // For display: submissions = actual votes + skipped (both count as "submitted")
    const votesWithSkipped = actualVoted + skipped;

    return { totalEligible, actualVoted, skipped, notVoted, votesWithSkipped };
  };

  const { totalEligible, actualVoted, skipped, notVoted, votesWithSkipped } = getParticipantCounts();

  // Calculate metrics based on corrected counts
  const votingProgress = totalEligible > 0 ? (votesWithSkipped / totalEligible) * 100 : 0;
  const isVotingComplete = votesWithSkipped === totalEligible && totalEligible > 0;
  const pendingVotes = totalEligible - votesWithSkipped;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border border-indigo-100">
      {/* Header with progress indicator */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Statistics
        </h2>
        {!revealed && (
          <div className="flex items-center gap-2">
            <div className="w-12 sm:w-16 lg:w-20 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-500 ${
                  isVotingComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${votingProgress}%` }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 min-w-[30px]">
              {Math.round(votingProgress)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Votes Progress */}
        <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-indigo-100 col-span-2 md:col-span-3 lg:col-span-2 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full shadow-sm ${isVotingComplete ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
            <h3 className="text-xs sm:text-sm font-medium text-indigo-600">
              Submissions
            </h3>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-700">
            {votesWithSkipped}<span className="text-lg sm:text-xl lg:text-2xl text-gray-500">/{totalEligible}</span>
          </div>
          {revealed ? (
            // After reveal: Show breakdown of not voted and skipped separately
            <div className="text-xs mt-1 space-y-0.5">
              {actualVoted > 0 && (
                <div className="text-green-600 font-medium">
                  {actualVoted} voted
                </div>
              )}
              {skipped > 0 && (
                <div className="text-yellow-600 font-medium">
                  {skipped} skipped
                </div>
              )}
              {notVoted > 0 && (
                <div className="text-red-600 font-medium">
                  {notVoted} not voted
                </div>
              )}
              {notVoted === 0 && skipped === 0 && actualVoted === totalEligible && (
                <div className="text-green-600 font-medium">
                  All voted
                </div>
              )}
            </div>
          ) : (
            // Before reveal: Show skipped count if any, and pending count
            <div className="text-xs mt-1 space-y-0.5">
              {skipped > 0 && (
                <div className="text-yellow-600 font-medium">
                  {skipped} skipped
                </div>
              )}
              {pendingVotes > 0 && (
                <div className="text-amber-600 font-medium">
                  {pendingVotes} pending
                </div>
              )}
              {pendingVotes === 0 && (
                <div className="text-green-600 font-medium">
                  All submitted
                </div>
              )}
            </div>
          )}
        </div>

        {/* Your Vote */}
        <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-purple-100 col-span-1 md:col-span-1 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full shadow-sm ${vote ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <h3 className="text-xs sm:text-sm font-medium text-purple-600">
              Your Vote
            </h3>
          </div>
          <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold transition-all duration-300 ${
            vote ? 'text-purple-700 transform scale-110' : 'text-gray-400'
          }`}>
            {vote || '?'}
          </div>
          <div className={`text-xs transition-colors duration-300 mt-1 ${
            vote ? 'text-green-600 font-medium' : 'text-gray-500'
          }`}>
            {vote ? 'Submitted' : 'Pending'}
          </div>
        </div>
        
        {/* Average Score - Highlighted when revealed */}
        <div className={`backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm col-span-1 md:col-span-1 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center transition-all duration-500 ${
          revealed 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 shadow-lg shadow-emerald-200/50 ring-1 ring-emerald-300/50' 
            : 'bg-white/90 border border-emerald-100 hover:shadow-md'
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
          <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold transition-all duration-300 ${
            revealed ? 'text-emerald-800 transform scale-110' : 'text-gray-400'
          }`}>
            {revealed && stats.average !== null ? stats.average : '?'}
          </div>
          <div className={`text-xs mt-1 transition-colors duration-300 ${
            revealed ? 'text-emerald-600 font-medium' : 'text-gray-500'
          }`}>
            {revealed ? 'Points' : 'Hidden'}
          </div>
        </div>

        {/* Min/Max Range */}
        <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-amber-100 col-span-1 md:col-span-1 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📈</span>
            <h3 className="text-xs sm:text-sm font-medium text-amber-600">
              Range
            </h3>
          </div>
          <div className={`text-lg sm:text-xl lg:text-2xl font-bold transition-all duration-300 ${
            revealed && stats.min !== null && stats.max !== null ? 'text-amber-700' : 'text-gray-400'
          }`}>
            {revealed && stats.min !== null && stats.max !== null ? 
              `${stats.min} - ${stats.max}` : '? - ?'
            }
          </div>
          <div className={`text-xs mt-1 transition-colors duration-300 ${
            revealed ? 'text-amber-600 font-medium' : 'text-gray-500'
          }`}>
            {revealed ? 'Min - Max' : 'Hidden'}
          </div>
        </div>

        {/* Consensus Level */}
        {revealed && stats.consensus !== undefined && (
          <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-sm border border-teal-100 col-span-1 md:col-span-1 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🎯</span>
              <h3 className="text-xs sm:text-sm font-medium text-teal-600">
                Consensus
              </h3>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-700 transform scale-110">
              {stats.consensus}%
            </div>
            <div className="text-xs text-teal-600 font-medium mt-1">
              Agreement
            </div>
          </div>
        )}

        {/* Session Status */}
        <div className={`p-3 sm:p-4 rounded-xl shadow-sm border col-span-1 md:col-span-1 lg:col-span-1 min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] flex flex-col justify-center items-center text-center transition-all duration-300 ${
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
          <div className={`text-sm sm:text-base lg:text-lg font-bold transition-all duration-300 ${
            revealed || isVotingComplete ? 'text-green-800' : 'text-red-800'
          }`}>
            {revealed ? 'Revealed' : isVotingComplete ? 'Ready' : 'Voting'}
          </div>
          <div className={`text-xs mt-1 transition-colors duration-300 ${
            revealed || isVotingComplete ? 'text-green-600 font-medium' : 'text-red-600'
          }`}>
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