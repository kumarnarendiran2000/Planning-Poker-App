/**
 * Utility functions for calculating statistics in the Planning Poker app
 */

/**
 * Calculate voting statistics from participant data
 * 
 * @param {Object} participants - The participants object from Firebase
 * @param {boolean} revealed - Whether votes are revealed or not
 * @returns {Object} Statistics object with average, min, max, and count values
 */
export const calculateStatistics = (participants, revealed = false) => {
  // If no participants, return empty stats
  if (!participants || Object.keys(participants).length === 0) {
    return { 
      average: null, 
      min: null, 
      max: null,
      count: 0,
      total: 0,
      distribution: []
    };
  }
  
  // Filter to only include actual voting participants (exclude facilitators and skipped)
  const votingParticipants = Object.values(participants)
    .filter(p => p.isParticipant !== false && p.vote !== 'SKIP'); // Exclude facilitators and skipped participants
  
  const totalVotingParticipants = votingParticipants.length;
  
  // If votes are not revealed, return empty stats but correct totals
  if (!revealed) {
    return { 
      average: null, 
      min: null, 
      max: null,
      count: 0,
      total: totalVotingParticipants,
      distribution: []
    };
  }
  
  // Parse votes and handle special values
  const allVotes = votingParticipants
    .filter(p => p.vote !== null && p.vote !== undefined);
  
  // Count votes by value for distribution
  const voteDistribution = {};
  allVotes.forEach(p => {
    const value = p.vote;
    voteDistribution[value] = (voteDistribution[value] || 0) + 1;
  });
  
  // Convert to array and calculate percentages
  const distribution = Object.entries(voteDistribution)
    .map(([value, count]) => ({
      value,
      count,
      percentage: allVotes.length > 0 ? Math.round((count / allVotes.length) * 100) : 0
    }))
    .sort((a, b) => {
      // Sort numeric values properly
      const numA = parseFloat(a.value);
      const numB = parseFloat(b.value);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Handle special values
      if (a.value === '?') return -1;
      if (b.value === '?') return 1;
      if (a.value === '☕') return -1;
      if (b.value === '☕') return 1;
      if (a.value === '∞') return 1;
      if (b.value === '∞') return -1;
      
      // Fallback to string comparison
      return a.value.localeCompare(b.value);
    });
  
  // Get valid numerical votes (exclude special votes)
  const numericVotes = allVotes
    .filter(p => p.vote !== '?' && p.vote !== '☕' && p.vote !== '∞')
    .map(p => {
      const value = parseFloat(p.vote);
      return isNaN(value) ? null : value;
    })
    .filter(v => v !== null);
  
  // Return empty stats if no valid numeric votes
  if (numericVotes.length === 0) {
    return { 
      average: null, 
      min: null, 
      max: null,
      count: allVotes.length,
      total: totalVotingParticipants,
      distribution
    };
  }
  
  // Sort for median calculation
  const sortedVotes = [...numericVotes].sort((a, b) => a - b);
  
  // Calculate median
  const middle = Math.floor(sortedVotes.length / 2);
  const median = sortedVotes.length % 2 === 0
    ? (sortedVotes[middle - 1] + sortedVotes[middle]) / 2
    : sortedVotes[middle];
  
  // Calculate statistics
  const sum = numericVotes.reduce((a, b) => a + b, 0);
  const average = sum / numericVotes.length;
  
  return {
    average: average.toFixed(1),
    median: median.toFixed(1),
    min: Math.min(...numericVotes),
    max: Math.max(...numericVotes),
    count: allVotes.length,
    total: totalVotingParticipants,
    distribution
  };
};

/**
 * Count the number of participants who have voted
 * 
 * @param {Object} participants - The participants object from Firebase
 * @returns {Object} Object with votesSubmitted and totalParticipants
 */
export const countVotes = (participants) => {
  if (!participants) {
    return {
      votesSubmitted: 0,
      totalParticipants: 0
    };
  }
  
  // Filter to only include actual voting participants (exclude facilitators and skipped)
  const votingParticipants = Object.values(participants)
    .filter(p => p.isParticipant !== false && p.vote !== 'SKIP'); // Exclude facilitators and skipped participants
  
  const votesSubmitted = votingParticipants
    .filter(p => p.vote !== null && p.vote !== undefined).length;
  
  return {
    votesSubmitted,
    totalParticipants: votingParticipants.length
  };
};