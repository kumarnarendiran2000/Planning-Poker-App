import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import CreateRoom from './components/CreateRoom'
import JoinRoom from './components/JoinRoom'
import ActiveSessions from './components/ActiveSessions'
import Room from './components/Room/index'
import FeedbackAnalytics from './components/admin/FeedbackAnalytics'
import RoomHistoryPage from './pages/RoomHistoryPage'
import NotFoundPage from './pages/NotFoundPage'
import AboutModal from './components/modals/AboutModal'
import FeedbackButton from './components/common/FeedbackButton'
import { runCleanupIfNeeded } from './services/cleanupService'
import { useActiveSessionMonitor } from './hooks/useActiveSessionMonitor'


function Home() {
  // State to force re-render when sessions change
  const [sessionsUpdated, setSessionsUpdated] = useState(0);
  // State for About modal
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // Monitor active sessions for deletions
  useActiveSessionMonitor();
  
  // Run cleanup when home page loads
  useEffect(() => {
    // Run cleanup in background without blocking UI
    runCleanupIfNeeded().catch(error => {
      console.error('Background cleanup failed:', error);
    });
  }, []);
  
  // Callback for session deletion
  const handleSessionDeleted = () => {
    setSessionsUpdated(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <span className="text-2xl">🃏</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 uppercase" style={{ letterSpacing: '0.05em' }}>
                Planning Poker
              </h1>
            </div>
            <button
              onClick={() => setShowAboutModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-colors duration-200"
            >
              <span>ℹ️</span>
              <span className="hidden sm:inline">Learn About Planning Poker</span>
              <span className="sm:hidden">Learn More</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-7xl w-full">
          {/* Wrapper Card with Glass Effect */}
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/60 p-6 sm:p-8 lg:p-10 mb-8">
            {/* Three Column Grid - Active Sessions, Create, Join */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Active Sessions Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-5 border border-gray-100 hover:shadow-3xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Active Sessions</h2>
                    <p className="text-xs text-gray-500">Your ongoing rooms</p>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  <ActiveSessions 
                    key={`sessions-${sessionsUpdated}`} 
                    onSessionDeleted={handleSessionDeleted} 
                  />
                </div>
              </div>
            </div>

            {/* Create Room Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-5 border border-gray-100 hover:shadow-3xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
                      <span className="text-xl">🚀</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create Room</h2>
                      <p className="text-xs text-gray-500">Start a new session</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Host a new Planning Poker session and invite your team
                  </p>
                  
                  {/* Compact Features List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Choose your role: Host or Facilitator</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Share room code with your team</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Control reveals and resets</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <CreateRoom />
                </div>
              </div>
            </div>

            {/* Join Room Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-5 border border-gray-100 hover:shadow-3xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
                      <span className="text-xl">👥</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Join Room</h2>
                      <p className="text-xs text-gray-500">Enter an existing session</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Have a room code? Join your team's session
                  </p>
                  
                  {/* Compact Features List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Enter name and room code</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Vote with Fibonacci sequence</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Real-time team estimates</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <JoinRoom />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights - Inside Wrapper Card */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">Why Choose Planning Poker?</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '⚡', title: 'Real-time Sync', desc: 'Instant updates across all devices' },
                { icon: '🎯', title: 'Role-Based', desc: 'Host, Participant, or Facilitator modes' },
                { icon: '📊', title: 'Statistics', desc: 'Automatic consensus detection' },
                { icon: '🔒', title: 'Auto-Cleanup', desc: 'Rooms expire after 4 hours' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:bg-white transition-all duration-200">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              © 2026 Planning Poker • Real-time Agile Estimation
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with ❤️ for Agile Teams</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Feedback Button */}
      <FeedbackButton 
        userRole="visitor"
      />
      
      {/* Modals */}
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
    </div>
  )
}

// Feedback Analytics Page Component
function FeedbackAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header — same as Home */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <span className="text-2xl">🃏</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 uppercase" style={{ letterSpacing: '0.05em' }}>
                Planning Poker
              </h1>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-colors duration-200"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">📊 Feedback Analytics Dashboard</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive insights into user feedback, suggestions, and improvement requests from your Planning Poker sessions.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <FeedbackAnalytics />
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-gray-600 shadow-sm border border-gray-200">
              <span>🔄</span>
              <span>Data updates in real-time • Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer — same as Home */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              © 2026 Planning Poker • Real-time Agile Estimation
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Made with ❤️ for Agile Teams</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        // Remove conflicting default durations - let enhancedToast handle all timing
        toastOptions={{
          className: '',
          style: {
            background: 'transparent', // Let custom toasts handle their own styling
            color: 'inherit',
          },
          // Disable built-in animations for instant dismissal
          duration: Infinity, // Prevent auto-dismiss
          unstyled: true, // Disable default styling/animations
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/room/:roomId/history" element={<RoomHistoryPage />} />
        <Route path="/admin/feedback" element={<FeedbackAnalyticsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
