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
      size="xl"
      className=""
    >
      <div className="space-y-6">
        {/* Back/Close Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">About Planning Poker</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Main Description */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                What is Planning Poker?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Planning Poker is a <strong>consensus-based estimation technique</strong> used by agile teams to estimate the effort or complexity of user stories during sprint planning. 
                It's designed to avoid <strong>anchoring bias</strong> by having all team members vote simultaneously using the Fibonacci sequence.
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Web */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Fibonacci Series */}
            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center text-lg">
                <span className="text-blue-600 mr-2 text-xl">🔢</span>
                Fibonacci Sequence
              </h4>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                Our tool uses the <strong>Fibonacci series</strong> (1, 2, 3, 5, 8, 13, 21, ?) which naturally reflects the <strong>increasing uncertainty</strong> in larger estimates:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {['1', '2', '3', '5', '8', '13', '21', '?'].map((card) => (
                  <span 
                    key={card}
                    className="px-3 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-2 border-blue-300 rounded-lg text-sm font-bold shadow-md"
                  >
                    {card}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                💡 The <strong>?</strong> card means "I don't understand" or "I need more information" - a signal to discuss the story further.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                <span className="mr-2 text-xl">🚀</span>
                How It Works
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Create or Join a Room</p>
                    <p className="text-gray-600 text-xs mt-1">Host creates a room and shares the code. Team members join using the room code.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Discuss the User Story</p>
                    <p className="text-gray-600 text-xs mt-1">Product owner or scrum master presents the user story. Team asks clarifying questions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Vote Simultaneously</p>
                    <p className="text-gray-600 text-xs mt-1">Each participant selects a Fibonacci card representing their estimate. Votes stay hidden until reveal.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold">4</span>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Reveal & Discuss</p>
                    <p className="text-gray-600 text-xs mt-1">Host reveals all votes at once. Team discusses differences, especially highest and lowest estimates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold">5</span>
                  <div>
                    <p className="text-gray-800 font-semibold text-sm">Reach Consensus</p>
                    <p className="text-gray-600 text-xs mt-1">Team re-votes if needed until consensus is reached. Final estimate is recorded.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Roles */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                <span className="text-purple-600 mr-2 text-xl">👥</span>
                Team Roles
              </h4>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <h5 className="font-semibold text-green-800 text-sm">Host Participant</h5>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    Creates and manages the room. Can vote, reveal estimates, reset sessions, and manage participants. Perfect for <strong>participating team leads</strong>.
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎯</span>
                    <h5 className="font-semibold text-orange-800 text-sm">Facilitator (Observer)</h5>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    Manages the room but <strong>doesn't vote</strong>. Ideal for <strong>Scrum Masters</strong> or Product Owners who facilitate but don't estimate.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">✋</span>
                    <h5 className="font-semibold text-purple-800 text-sm">Participant</h5>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    Team members who vote on story points. Developers, QA, designers - anyone involved in implementing the story.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                <span className="mr-2 text-xl">✨</span>
                Key Features
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">📊</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">Real-time Statistics</h5>
                    <p className="text-gray-600 text-xs">Average, median, mode, consensus detection, and vote distribution charts.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🔄</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">Live Collaboration</h5>
                    <p className="text-gray-600 text-xs">Real-time updates, synchronized voting, instant notifications for all participants.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🎮</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">Skip Option</h5>
                    <p className="text-gray-600 text-xs">Participants can skip voting if they lack context or are not involved in the story.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🔒</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-sm">Auto-Cleanup</h5>
                    <p className="text-gray-600 text-xs">Rooms automatically delete after 4 hours of inactivity. No data stored permanently.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Scrum Masters */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-indigo-300">
          <h4 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
            <span className="mr-2 text-xl">💡</span>
            Tips for Scrum Masters & Team Leads
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Set clear acceptance criteria</strong> before voting begins.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Discuss outliers</strong> - ask why highest and lowest voters chose their estimates.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Encourage questions</strong> - use the ? card to signal need for clarification.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Avoid anchoring bias</strong> - reveal all votes simultaneously, never one by one.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Keep it timeboxed</strong> - limit discussion to 5-10 minutes per story.</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <p className="text-gray-700 text-sm"><strong>✓ Use facilitator role</strong> if you're not directly involved in implementation.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-4 pb-2 border-t border-gray-200">
          <p className="text-gray-700 mb-4 text-base font-medium">
            Ready to make your sprint planning more efficient? 🚀
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-colors duration-200 text-base"
          >
            Start Planning Session 🎯
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;