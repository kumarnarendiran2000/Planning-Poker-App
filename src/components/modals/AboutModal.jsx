import React from 'react';
import Modal from '../common/Modal';

const AboutModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showOk={false}
      showCancel={false}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Back/Close Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">About Planning Poker</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            <span className="mr-2">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Main Description */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
            <span className="text-2xl text-white font-bold">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Sprint Planning Made Simple
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            This Planning Poker tool is designed specifically for <strong>Agile teams</strong> during sprint planning sessions to estimate story points collaboratively and efficiently.
          </p>
        </div>

        {/* Fibonacci Series Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 sm:p-6 border-l-4 border-gradient-to-b border-blue-500">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
            <span className="text-blue-600 mr-2">🔢</span>
            Fibonacci Sequence Estimation
          </h4>
          <p className="text-gray-700 mb-3 text-sm sm:text-base">
            Uses the proven <strong className="text-blue-600">Fibonacci series</strong> for story point estimation:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['1', '2', '3', '5', '8', '13', '21', '?'].map((card) => (
              <span 
                key={card}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-white border-2 border-blue-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 shadow-sm"
              >
                {card}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-3">
            The Fibonacci sequence naturally reflects the uncertainty in larger estimates, making it perfect for agile planning.
          </p>
        </div>

        {/* Key Features */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4 text-center text-sm sm:text-base">✨ Key Features</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">📊</span>
                <h5 className="font-medium text-gray-800 text-sm sm:text-base">Real-time Statistics</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Live voting statistics with average, consensus tracking, and vote distribution analysis.
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 mr-2">👥</span>
                <h5 className="font-medium text-gray-800 text-sm sm:text-base">Session Management</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Create rooms, manage participants, host controls for revealing and resetting votes.
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-purple-600 mr-2">🔄</span>
                <h5 className="font-medium text-gray-800 text-sm sm:text-base">Live Collaboration</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Real-time updates, synchronized voting, and instant notifications for all participants.
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-orange-600 mr-2">🏠</span>
                <h5 className="font-medium text-gray-800 text-sm sm:text-base">Room Controls</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">
                Automatic cleanup, participant management, and session persistence across devices.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h4 className="font-semibold text-gray-800 mb-4 text-center text-sm sm:text-base">🚀 How It Works</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold mr-3 mt-0.5">1</span>
              <p className="text-gray-700 text-xs sm:text-sm"><strong>Create or Join</strong> a planning session room</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold mr-3 mt-0.5">2</span>
              <p className="text-gray-700 text-xs sm:text-sm"><strong>Vote</strong> on story points using Fibonacci cards</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold mr-3 mt-0.5">3</span>
              <p className="text-gray-700 text-xs sm:text-sm"><strong>Reveal</strong> votes simultaneously to avoid bias</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold mr-3 mt-0.5">4</span>
              <p className="text-gray-700 text-xs sm:text-sm"><strong>Discuss</strong> and reach consensus on estimates</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-4 pb-4">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Ready to make your sprint planning more efficient?
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
          >
            Start Planning Session 🎯
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;