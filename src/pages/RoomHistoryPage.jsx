import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import historyService from '../services/historyService';

/**
 * Displays the round history for a room.
 * Route: /room/:roomId/history
 */
const RoomHistoryPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    historyService
      .getRounds(roomId)
      .then(setRounds)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  const formatTimestamp = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatVote = (vote) => {
    if (vote === null || vote === undefined) return '—';
    if (vote === 'SKIP') return 'Skip';
    return vote;
  };

  const buildClipboardText = () => {
    if (!rounds.length) return 'No rounds recorded.';
    return rounds
      .map((r, i) => {
        const voteLines = Object.entries(r.votes || {})
          .map(([name, vote]) => `  ${name}: ${formatVote(vote)}`)
          .join('\n');
        const statsLine = r.stats?.average
          ? `  Avg: ${r.stats.average} | Min: ${r.stats.min} | Max: ${r.stats.max} | Median: ${r.stats.median}`
          : '';
        return `Round ${i + 1}: ${r.story}\n${voteLines}${statsLine ? '\n' + statsLine : ''}`;
      })
      .join('\n\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildClipboardText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/room/${roomId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-full shadow hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Room
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Round History</h1>
              <p className="text-xs text-gray-500">Room: {roomId}</p>
            </div>
          </div>

          {rounds.length > 0 && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-700 text-sm font-medium rounded-full shadow-sm hover:shadow transition-all"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy for Jira
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-500 text-sm gap-2">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Loading history...
          </div>
        )}

        {!loading && rounds.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No rounds yet</h2>
            <p className="text-sm text-gray-500">Rounds are saved automatically when votes are revealed.</p>
          </div>
        )}

        {!loading &&
          rounds.map((round, index) => {
            const voteEntries = Object.entries(round.votes || {});
            const hasStats = round.stats?.average !== null && round.stats?.average !== undefined;

            return (
              <div
                key={round.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                {/* Round header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{round.story}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatTimestamp(round.timestamp)}</span>
                </div>

                {/* Votes table */}
                <div className="px-5 py-4">
                  {voteEntries.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No votes recorded.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {voteEntries.map(([name, vote]) => (
                        <div
                          key={name}
                          className={`flex flex-col items-center px-3 py-2 rounded-xl border text-sm font-medium min-w-[64px] ${
                            vote === 'SKIP'
                              ? 'bg-gray-50 border-gray-200 text-gray-400'
                              : vote === null
                              ? 'bg-gray-50 border-dashed border-gray-200 text-gray-400'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                          }`}
                        >
                          <span className="text-lg font-bold leading-tight">{formatVote(vote)}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[80px] text-center mt-0.5">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  {hasStats && (
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                      {[
                        { label: 'Average', value: round.stats.average },
                        { label: 'Median', value: round.stats.median },
                        { label: 'Min', value: round.stats.min },
                        { label: 'Max', value: round.stats.max },
                      ].map(({ label, value }) =>
                        value !== null && value !== undefined ? (
                          <div key={label} className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
                            <div className="text-base font-bold text-indigo-700">{value}</div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
};

export default RoomHistoryPage;
