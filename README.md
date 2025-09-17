# 🃏 Planning Poker App

A comprehensive real-time Planning Poker application built with React and Firebase, designed to enhance agile estimation processes for distributed teams. Features advanced functionality including countdown timers, vote skipping, enhanced statistics, and robust session management.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange)
![Vite](https://img.shields.io/badge/Vite-7.1.5-646CFF)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC)
![Production Ready](https://img.shields.io/badge/Status-Production_Ready-green)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Key Features

### Core Functionality
- **🏠 Create Rooms**: Facilitators can create unique Planning Poker sessions with role-based access
- **👥 Join Sessions**: Participants can join using room codes with persistent session management
- **🃏 Fibonacci Voting**: Complete Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, ?) with unknown estimation support
- **⏭️ Skip/Unskip Voting**: Participants can skip rounds and return to voting seamlessly
- **⏰ Reveal Countdown**: 3-2-1 countdown timer before vote reveal with host-cancelable functionality
- **📊 Real-time Updates**: Instant synchronization across all participants via Firebase Realtime Database
- **🎯 Controlled Reveals**: Host manages when to reveal votes with visual countdown
- **📈 Advanced Statistics**: Comprehensive stats with proper handling of skipped votes and non-participants
- **🔄 Enhanced Reset**: Smooth reset experience with loading indicators and real-time feedback
- **👑 Role-Based Controls**: Distinct roles for Facilitators, Host Participants, and Participants

### User Experience Enhancements
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with cohesive purple/indigo theme and smooth animations
- **🔔 Smart Notifications**: Enhanced toast system with contextual feedback and proper error handling
- **💾 Session Persistence**: Automatic session management with localStorage and active session tracking
- **⚡ Real-time Sync**: Firebase-powered real-time updates with race condition prevention
- **🚪 Graceful Exit**: Intelligent cleanup when users leave sessions with proper role handling
- **📋 Active Sessions Panel**: Homepage display of all active sessions with role badges
- **🛡️ Production Ready**: Cleaned console logs, comprehensive error handling, and optimized performance

### Advanced Features
- **🔐 Session Management**: Unique session IDs with role distinction (Facilitator/Host Participant/Participant)
- **👨‍💼 Role-Based Privileges**: 
  - **Facilitators**: Room management only (no voting)
  - **Host Participants**: Full control including voting
  - **Participants**: Voting and skip functionality
- **📊 Smart Statistics**: Post-reveal breakdown showing "X not voted" vs "X skipped" participants
- **🛡️ Error Handling**: Comprehensive error management with user-friendly feedback
- **🧹 Auto Cleanup**: Automatic room cleanup with 4-hour lifecycle management
- **📋 Session Tracking**: Visual role badges on homepage (Facilitator/Host Participant/Participant)
- **🔄 State Synchronization**: Race condition prevention with Firebase-first state management
- **ℹ️ Educational Content**: Comprehensive app information and Planning Poker guidance

## 🏗️ Tech Stack

```
Frontend:     React 19.1.1 + Vite
Database:     Firebase Realtime Database  
Styling:      Tailwind CSS
Hosting:      Firebase Hosting
State:        Custom Hooks + React Context
```

## 🎮 User Flow

### **Roles**
- **🔵 Facilitator**: Room management only (no voting)
- **🟢 Host Participant**: Full control + voting capability  
- **🟣 Participant**: Voting + skip functionality

### **Voting Process**
1. **Vote**: Select Fibonacci (1,2,3,5,8,13,21,?) or Skip
2. **Reveal**: Host triggers 3-2-1 countdown → auto-reveal
3. **Statistics**: View results excluding skipped participants
4. **Reset**: Clear votes with real-time loading

## 🛠️ Setup

### Prerequisites
```bash
Node.js 18+, pnpm, Firebase Project
```

### Quick Start
```bash
git clone https://github.com/kumarnarendiran2000/Planning-Poker-App.git
cd Planning-Poker-App
pnpm install

# Configure Firebase
cp .env.example .env
# Add Firebase config to .env

pnpm dev              # Development
pnpm deploy:hosting   # Deploy
```

### Environment Variables
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📚 API Reference

### Core Methods
```javascript
// Voting
await RoomService.submitVote(roomId, participantId, value)
await RoomService.skipVote(roomId, participantId)
await RoomService.unskipVote(roomId, participantId)

// Countdown & Reveal
await RoomService.startCountdown(roomId)
await RoomService.cancelCountdown(roomId)
await RoomService.revealVotes(roomId)

// Reset
await RoomService.startResetState(roomId)
await RoomService.resetVotes(roomId)
await RoomService.stopResetState(roomId)
```

### Hooks
```javascript
const { participants, revealed, countdown, resetState } = useRoomState(roomId)
const { vote, handleVote, handleSkip, handleUnskip } = useVoting(...)
const sessions = getActiveSessions() // [{roomId, userName, isHost, isParticipant}]
```

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Room/
│   │   ├── index.jsx              # Main room component
│   │   ├── VotingCards.jsx        # Fibonacci voting interface
│   │   ├── StatisticsPanel.jsx    # Enhanced statistics display
│   │   ├── ParticipantList.jsx    # Real-time participant list
│   │   └── HostControls.jsx       # Host-only controls
│   ├── common/
│   │   ├── RevealCountdown.jsx    # 3-2-1 countdown timer
│   │   ├── ResetLoader.jsx        # Reset loading indicator
│   │   └── Modal.jsx              # Reusable modal component
│   └── modals/
│       ├── NameModal.jsx          # Name input modal
│       ├── AboutModal.jsx         # App information
│       └── DeleteRoomModal.jsx    # Room deletion confirmation
├── hooks/
│   ├── useRoom.js                 # Room state management
│   ├── useVoting.js               # Voting logic
│   └── useRoomState.js            # Real-time state subscription
├── services/
│   ├── roomService.js             # Firebase operations
│   └── cleanupService.js          # Automatic cleanup
└── utils/
    ├── localStorage.js            # Session persistence
    ├── statistics.js              # Statistical calculations
    └── constants.js               # App constants
```

### Key Hooks Usage

#### **Enhanced useVoting Hook**
```javascript
const {
  vote, canVote, isSkipped,        // Voting state
  handleVote, handleSkip, handleUnskip,  // Basic actions
  executeReveal, cancelCountdown   // New: countdown methods
} = useVoting(roomId, sessionId, participants, revealed, isHost)

// Real-time state subscription
const {
  participants, revealed, countdown, resetState
} = useRoomState(roomId)

// Firebase listener management
const roomData = useRoomSubscription(roomId)
```

### Component Props & Usage

#### **RevealCountdown Component**
```javascript
<RevealCountdown
  isVisible={!!countdown?.active}    // Show when countdown active
  onComplete={executeReveal}         // Execute reveal when countdown ends
  onCancel={cancelCountdown}         // Cancel countdown (host only)
  showCancelButton={isHost}          // Only show cancel for hosts
/>
```

#### **ResetLoader Component**
```javascript
<ResetLoader
  isVisible={!!resetState?.active}  // Show during reset operations
/>
```

#### **VotingCards with Skip/Unskip**
```javascript
<VotingCards
  values={FIBONACCI_SEQUENCE}       // ['1', '2', '3', '5', '8', '13', '21', '?']
  vote={vote}                       // Current user's vote
  onVote={handleVote}               // Handle voting
  onSkip={handleSkip}               // Handle skip action
  onUnskip={handleUnskip}           // Handle unskip action
  revealed={revealed}               // Whether votes are revealed
  disabled={revealed}               // Disable voting after reveal
/>
```

#### **Enhanced StatisticsPanel**
```javascript
<StatisticsPanel
  participants={participants}       // All room participants
  vote={vote}                      // Current user's vote
  revealed={revealed}              // Reveal status
  totalParticipants={totalCount}   // Total participant count
  votesSubmitted={votedCount}      // Votes submitted count
  isVotingComplete={allVoted}      // All participants voted
  stats={stats}                    // Calculated statistics
/>
```

### LocalStorage Session Management
```javascript
// Enhanced session utilities with role tracking
import { 
  getUserName, setUserName,
  getSessionId, setSessionId,
  isUserHost, setUserHost,
  isUserParticipant, setUserParticipant,
  getActiveSessions,              // New: Get all active sessions with roles
  getSessionForRoom,              // Check existing session
  clearRoomData                   // Clean up session data
} from './utils/localStorage.js';

// Example usage:
const sessions = getActiveSessions();
// Returns: [{ roomId, userName, sessionId, isHost, isParticipant }]
```

### Error Handling Patterns
```javascript
// Production-ready error handling with enhanced toasts
try {
  await RoomService.submitVote(roomId, sessionId, value);
  enhancedToast.success('Vote submitted successfully!');
} catch (error) {
  console.error('Error submitting vote:', error);
  enhancedToast.error('Failed to submit vote: ' + error.message);
}

// Countdown error handling
try {
  await RoomService.startCountdown(roomId);
} catch (error) {
  console.error('Error starting countdown:', error);
  // Graceful fallback - immediate reveal
  await RoomService.revealVotes(roomId);
}
```

## 🔧 Development

### Available Scripts
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm deploy:hosting   # Deploy to Firebase Hosting
pnpm lint             # Run ESLint
```

### Project Structure
```
Planning-Poker-App/
├── src/                    # Source code
├── public/                 # Static assets
├── .env                   # Environment variables (local)
├── .env.example           # Environment template
├── firebase.json          # Firebase configuration
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind CSS config
├── vite.config.js         # Vite configuration
└── README.md              # Documentation
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Build and deploy
pnpm build
pnpm deploy:hosting

# Or use the combined command
pnpm deploy:hosting
```

### Environment Setup
1. Create Firebase project
2. Enable Realtime Database
3. Configure hosting
4. Set up environment variables
5. Deploy with `pnpm deploy:hosting`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Room creation and joining
- [ ] Voting with Fibonacci sequence
- [ ] Skip/unskip functionality
- [ ] Countdown timer and cancellation
- [ ] Vote reveal and statistics
- [ ] Reset functionality with loading
- [ ] Role-based access control
- [ ] Session persistence
- [ ] Responsive design
- [ ] Error handling

### Testing Guidelines
```bash
# Test different user roles
1. Create room as Facilitator
2. Join as Host Participant
3. Join as regular Participant
4. Test all voting scenarios
5. Verify statistics accuracy
6. Test countdown functionality
7. Validate session persistence
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ✅ ESLint configuration enforced
- ✅ Consistent naming conventions
- ✅ JSDoc comments for functions
- ✅ React best practices
- ✅ Performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kumar Narendiran**
- GitHub: [@kumarnarendiran2000](https://github.com/kumarnarendiran2000)
- LinkedIn: [Kumar Narendiran](https://linkedin.com/in/kumarnarendiran2000)

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for real-time database
- Tailwind CSS for utility-first styling
- Vite for lightning-fast development
- React Hot Toast for notifications

---

*Built with ❤️ for agile teams worldwide*