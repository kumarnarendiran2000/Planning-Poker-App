import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import CreateRoom from './components/CreateRoom'
import JoinRoom from './components/JoinRoom'
import ActiveSessions from './components/ActiveSessions'
import Room from './components/Room/index'
import FeedbackAnalytics from './components/admin/FeedbackAnalytics'
import AboutModal from './components/modals/AboutModal'
import { runCleanupIfNeeded } from './services/cleanupService'
import { useActiveSessionMonitor } from './hooks/useActiveSessionMonitor'

// Navigation Header Component (only for analytics page)
function NavigationHeader() {
  const location = useLocation();
  const isAnalyticsPage = location.pathname === '/admin/feedback';
  
  // Only show header on analytics page
  if (!isAnalyticsPage) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <span className="text-2xl">🃏</span>
            <span>Planning Poker</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span>🏠</span>
              <span>Back to Home</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Planning Poker</h1>
                
                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <button
                    onClick={() => setShowAboutModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm"
                  >
                    <span className="mr-2">ℹ️</span>
                    Learn about Planning Poker
                  </button>
                </div>
                
                {/* Display active sessions at the top */}
                <ActiveSessions 
                  key={`sessions-${sessionsUpdated}`} 
                  onSessionDeleted={handleSessionDeleted} 
                />
                
                <CreateRoom />
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                     <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm font-bold rounded-full shadow-md">OR</span>
                  </div>
                </div>
                <JoinRoom />
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">📊 Feedback Analytics Dashboard</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive insights into user feedback, suggestions, and improvement requests from your Planning Poker sessions.
            </p>
          </div>
        </div>
        
        {/* Analytics Component */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <FeedbackAnalytics />
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm text-gray-600 shadow-sm border border-gray-200">
            <span>🔄</span>
            <span>Data updates in real-time • Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavigationHeader />
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20, // Reset to normal since header only on analytics
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
        <Route path="/admin/feedback" element={<FeedbackAnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
