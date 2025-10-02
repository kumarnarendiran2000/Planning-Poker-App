import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';
import { useFeedback } from '../../hooks/useFeedback';

/**
 * FeedbackAnalytics Component (Optional - for admins)
 * Displays submitted feedback for analytics and management
 * This would typically be in an admin dashboard
 */
const FeedbackAnalytics = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  const { getFeedbackStats, FEEDBACK_TYPES } = useFeedback();

  // Helper function to get feedback type display name
  const getFeedbackTypeDisplay = (type) => {
    const typeMap = {
      [FEEDBACK_TYPES.BUG]: 'Bug Report',
      [FEEDBACK_TYPES.FEATURE]: 'Feature Request',
      [FEEDBACK_TYPES.GENERAL]: 'General Feedback',
      [FEEDBACK_TYPES.UI_UX]: 'UI/UX Improvement',
      [FEEDBACK_TYPES.PERFORMANCE]: 'Performance Issue'
    };
    return typeMap[type] || 'Unknown';
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load recent feedback
      const recentFeedback = await feedbackService.getRecentFeedback(100);
      setFeedbacks(recentFeedback);

      // Get statistics
      const statisticsData = await getFeedbackStats();
      setStats(statisticsData);

    } catch (err) {
      console.error('Error loading feedback data:', err);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading feedback data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadFeedbackData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
            </div>
            <p className="text-gray-600">Real-time insights from user feedback and suggestions</p>
          </div>
          <button
            onClick={loadFeedbackData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-700 font-medium">Total Feedback</div>
              </div>
              <div className="text-3xl text-blue-500">💬</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.avgRating}</div>
                <div className="text-gray-700 font-medium">Average Rating</div>
              </div>
              <div className="text-3xl text-green-500">⭐</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {Object.values(stats.byType).reduce((a, b) => Math.max(a, b), 0)}
                </div>
                <div className="text-gray-700 font-medium">Most Common</div>
              </div>
              <div className="text-3xl text-purple-500">📈</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.byRating[5] || 0}
                </div>
                <div className="text-gray-700 font-medium">5-Star Reviews</div>
              </div>
              <div className="text-3xl text-orange-500">🌟</div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
            </div>
            <div className="text-sm text-gray-500">
              Showing {feedbacks.length} entries
            </div>
          </div>
        </div>
        
        {feedbacks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feedback submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getFeedbackTypeDisplay(feedback.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {feedback.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {feedback.userDetails?.name || 'Anonymous'}
                        {feedback.userDetails?.email && (
                          <div className="text-xs text-gray-500">{feedback.userDetails.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {feedback.rating ? (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1">{feedback.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(feedback.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackAnalytics;