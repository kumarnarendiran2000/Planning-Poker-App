import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import CreateRoom from './components/CreateRoom'
import JoinRoom from './components/JoinRoom'
import ActiveSessions from './components/ActiveSessions'
import Room from './components/Room/index'
import AboutModal from './components/modals/AboutModal'
import { runCleanupIfNeeded } from './services/cleanupService'

function Home() {
  // State to force re-render when sessions change
  const [sessionsUpdated, setSessionsUpdated] = useState(0);
  // State for About modal
  const [showAboutModal, setShowAboutModal] = useState(false);
  
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
                
                {/* About button */}
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowAboutModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="mr-2">ℹ️</span>
                    Learn About Planning Poker
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
      
      {/* About Modal */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  )
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
