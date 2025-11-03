# GitHub Copilot Instructions for Planning Poker App

## 🎯 Project Overview

This is a **real-time Planning Poker web application** for agile teams to collaboratively estimate story points using the Fibonacci sequence. The app enables distributed teams to conduct synchronized estimation sessions with role-based access control.

### Core Purpose
- Enable remote agile teams to estimate story complexity in real-time
- Prevent anchoring bias through simultaneous vote reveals
- Support multiple roles: Facilitators (observers), Host Participants (voting hosts), and Regular Participants
- Provide visual feedback, statistics, and consensus detection

---

## 🏗️ Architecture & Tech Stack

### **Technology Stack**
```
Frontend:     React 19.1.1 + Vite 7.1.2
Database:     Firebase Realtime Database (real-time sync)
Storage:      Firebase Firestore (email queue, feedback)
Styling:      Tailwind CSS 3.4.17
Routing:      React Router DOM 7.8.2
Notifications: React Hot Toast 2.6.0
Hosting:      Firebase Hosting
```

### **Key Dependencies**
- `firebase` (v12.2.1) - Real-time database and Firestore
- `react` (v19.1.1) - UI framework
- `react-router-dom` (v7.8.2) - Client-side routing
- `react-hot-toast` (v2.6.0) - Toast notifications
- `uuid` (v13.0.0) - Unique ID generation
- `prop-types` (v15.8.1) - Runtime type checking

---

## 📂 Project Structure

```
src/
├── App.jsx                 # Main app component with routing
├── main.jsx               # React entry point with passive event listeners
├── index.css              # Global Tailwind styles
├── components/
│   ├── CreateRoom.jsx           # Room creation with email notifications
│   ├── JoinRoom.jsx             # Join existing room
│   ├── ActiveSessions.jsx       # Display user's active sessions
│   ├── Room/                    # Room components (main feature)
│   │   ├── index.jsx           # Main room orchestrator
│   │   ├── ParticipantList.jsx # Participant display with filters
│   │   ├── RoomHeader.jsx      # Room header with info
│   │   ├── HostControls.jsx    # Host action buttons
│   │   ├── VotingCards.jsx     # Fibonacci voting cards
│   │   ├── StatisticsPanel.jsx # Vote statistics & consensus
│   │   └── ...other room components
│   ├── common/
│   │   ├── Modal.jsx           # Reusable modal component
│   │   ├── FeedbackButton.jsx  # Feedback submission
│   │   ├── RevealCountdown.jsx # 3-2-1 countdown animation
│   │   └── ResetLoader.jsx     # Reset loading animation
│   ├── modals/
│   │   ├── AboutModal.jsx      # Planning Poker explanation
│   │   ├── AlertModal.jsx      # Confirmation dialogs
│   │   ├── FeedbackModal.jsx   # User feedback form
│   │   └── ...other modals
│   └── admin/
│       └── FeedbackAnalytics.jsx # Admin feedback dashboard
├── hooks/
│   ├── useRoom.js              # Main room state orchestrator
│   ├── useRoomState.js         # Room state management
│   ├── useRoomInitialization.js # Room initialization logic
│   ├── useRoomSubscription.js  # Firebase subscriptions
│   ├── useRoomOperations.js    # Join/delete operations
│   ├── useVoting.js            # Voting logic
│   ├── useStoryOperations.js   # Story name updates
│   ├── useFeedback.js          # Feedback operations
│   └── useActiveSessionMonitor.js # Monitor active sessions
├── services/
│   ├── roomService.js          # Firebase room operations
│   ├── firebaseReferences.js   # Firebase ref helpers
│   ├── roomValidation.js       # Room validation logic
│   ├── cleanupService.js       # Auto-cleanup old rooms
│   ├── feedbackService.js      # Feedback Firestore operations
│   └── firestoreEmailService.js # Email notification queue
├── utils/
│   ├── constants.js            # App constants (Fibonacci, paths)
│   ├── enhancedToast.jsx       # Custom toast notifications
│   ├── statistics.js           # Vote statistics calculations
│   ├── roomHelpers.js          # Room helper functions
│   ├── roomOperations.js       # Room CRUD operations
│   ├── localStorage.js         # Local storage management
│   ├── formValidation.js       # Form validation utilities
│   └── validation.js           # General validation
├── config/                     # Configuration files (if any)
└── firebase/
    └── config.js              # Firebase initialization

```

---

## 🔥 Firebase Architecture

### **Realtime Database Structure**
```javascript
rooms/
  {roomId}/
    createdAt: timestamp
    status: "active" | "deleting"
    revealed: boolean
    story: string (story name/number)
    countdown: { active: boolean, startTime: timestamp }
    resetState: { active: boolean, startTime: timestamp }
    resetNotification: { timestamp: number, notified: boolean }
    emailNotifications: { enabled: boolean, userEmail: string, adminEmail: string }
    participants/
      {sessionId}/
        name: string
        vote: string | "SKIP" | null
        isHost: boolean
        isParticipant: boolean (false = facilitator)
        joinedAt: timestamp
        kicked: { timestamp: number, by: string }
```

### **Firestore Collections**
```javascript
// Email queue for Firebase Extension (Trigger Email)
mail/
  {docId}/
    to: string | string[]
    message: { subject: string, html: string, text: string }
    
// User feedback
feedbacks/
  {docId}/
    type: "bug" | "feature" | "improvement" | "other"
    message: string
    userRole: string
    userName: string (optional)
    roomId: string (optional)
    createdAt: timestamp
    rating: number (1-5)
```

---

## 🎭 Role System

### **Three Role Types**

1. **Facilitator (Host, Non-Participant)**
   - Creates and manages the room
   - Controls reveals and resets
   - Can remove participants
   - **Does NOT vote** (isHost: true, isParticipant: false)
   - Ideal for Scrum Masters observing

2. **Host Participant (Host + Voter)**
   - Creates and manages the room
   - **Can vote** (isHost: true, isParticipant: true)
   - Full control + estimation capability
   - Ideal for participating team leads

3. **Regular Participant**
   - Can vote and skip
   - No management controls
   - (isHost: false, isParticipant: true)

### **Role Identification Logic**
```javascript
// Check if user is a facilitator
const isFacilitator = participant.isHost && participant.isParticipant === false;

// Check if user is a host participant
const isHostParticipant = participant.isHost && participant.isParticipant !== false;

// Check if user can vote
const canVote = participant.isParticipant !== false;
```

### **Role Management (Host Controls)**

Hosts can manage other participants' roles through an interactive dropdown menu:

#### Available Actions
1. **Promote to Host Participant** - Give host privileges with voting rights
2. **Promote to Facilitator** - Give host privileges without voting (observer)
3. **Demote to Participant** - Remove host privileges
4. **Toggle Voting Status** - Enable/disable voting for hosts
5. **Remove from Room** - Kick participant

#### Implementation
```javascript
// Promote participant to host with voting
await RoomService.promoteToHost(roomId, participantId, true, hostName);

// Promote to facilitator (no voting)
await RoomService.promoteToHost(roomId, participantId, false, hostName);

// Demote host to participant
await RoomService.demoteFromHost(roomId, participantId, hostName);

// Toggle voting status
await RoomService.toggleVotingStatus(roomId, participantId, canVote, hostName);
```

#### UX Features
- **Interactive Dropdown Menu** - 3-dot menu icon for each participant
- **Modal Confirmations** - AlertModal for all role changes (no JavaScript alerts)
- **Toast Notifications** - Success/error feedback with emojis
- **Email Notifications** - Automatic notifications for role changes
- **Real-time Updates** - Firebase syncs role changes instantly

---

## 🔄 Real-Time State Flow

### **Room Lifecycle**
```
1. CREATE ROOM
   ↓ Generate unique room code
   ↓ Set createdAt timestamp
   ↓ Add creator as first participant
   ↓ Setup Firebase listeners

2. PARTICIPANTS JOIN
   ↓ Subscribe to room updates
   ↓ Add to participants collection
   ↓ Send email notifications (if enabled)

3. VOTING PHASE
   ↓ Participants submit votes (Fibonacci)
   ↓ Real-time vote count updates
   ↓ Option to skip voting

4. REVEAL COUNTDOWN
   ↓ Host triggers 3-2-1 countdown
   ↓ Countdown animation (3 seconds)
   ↓ Host can cancel during countdown

5. REVEAL VOTES
   ↓ Set revealed: true
   ↓ Show all votes simultaneously
   ↓ Calculate statistics (consensus, avg, etc.)

6. RESET
   ↓ Clear all votes
   ↓ Set revealed: false
   ↓ Clear story name
   ↓ Show reset notification

7. DELETE/CLEANUP
   ↓ Manual delete by host
   ↓ Auto-cleanup after 4 hours
   ↓ Email notifications sent
```

### **Critical State Management Rules**

1. **Never directly mutate Firebase data** - Always use `set()` or `update()`
2. **Check for room deletion** - Monitor `status: "deleting"` field
3. **Handle kicked participants** - Check `kicked` field in participant data
4. **Respect revealed state** - Never show votes before `revealed: true`
5. **Cleanup listeners** - Always unsubscribe from Firebase listeners on unmount

---

## 🎨 Component Patterns

### **Custom Hooks Pattern**
All major features use custom hooks for state management:
```javascript
// Hook composition pattern
const useRoom = (roomId, alertFunctions) => {
  const state = useRoomState(roomId);
  useRoomInitialization(roomId, state, navigation, alerts);
  useRoomSubscription(roomId, state, navigation);
  const operations = useRoomOperations(roomId, state, navigation, alerts);
  return { ...state, ...operations };
};
```

### **Memoization Strategy**
Use `useMemo` for expensive computations:
```javascript
// Memoize participant sorting and filtering
const sortedParticipants = useMemo(() => {
  // Sort: Current user → Facilitator → Host → Participant → Name
}, [participants, sessionId, isLoading]);

const filteredParticipants = useMemo(() => {
  // Filter by vote status
}, [sortedParticipants, activeFilter]);
```

### **React.memo for Performance**
Wrap components that receive frequently changing props:
```javascript
export default React.memo(ParticipantList);
```

---

## 🎯 Key Features Implementation

### **1. Voting System**

#### Fibonacci Sequence
```javascript
export const FIBONACCI_SEQUENCE = ['1', '2', '3', '5', '8', '13', '21', '?'];
```

#### Vote States
- `null` or `''` - Not voted
- `'1'` to `'21'` or `'?'` - Voted with value
- `'SKIP'` - Skipped voting

#### Vote Logic
```javascript
// Submit vote
await RoomService.submitVote(roomId, sessionId, voteValue);

// Skip vote
await RoomService.skipVote(roomId, sessionId);

// Unskip (allow revoting)
await RoomService.unskipVote(roomId, sessionId);
```

### **2. Participant List Filters**

#### Status Filters
- **All** - Show all participants
- **Voted** - Only those who voted (excluding SKIP)
- **Not Voted** - Haven't voted yet
- **Skipped** - Chose to skip

#### Vote Value Filters (only when revealed)
- **All Votes** - Show all
- **Specific Points** - Filter by vote value (e.g., "3 pts")
- **Highest** - Only highest numeric votes
- **Lowest** - Only lowest numeric votes

#### Filter Logic
```javascript
const filteredParticipants = useMemo(() => {
  // Facilitators only appear in 'all' filter
  if (participant.isParticipant === false && activeFilter !== 'all') {
    return false;
  }
  
  // Apply status filter
  // Apply vote value filter (if revealed)
}, [sortedParticipants, activeFilter, activeVoteFilter]);
```

### **3. Countdown Animation**

#### 3-2-1 Countdown Flow
```javascript
// Host triggers countdown
await RoomService.startRevealCountdown(roomId);

// Countdown component listens to Firebase
countdown: { active: true, startTime: Date.now() }

// After 3 seconds → execute reveal
await RoomService.revealVotes(roomId);
await RoomService.stopRevealCountdown(roomId);
```

#### Cancellation
Host can cancel countdown before it completes:
```javascript
await RoomService.stopRevealCountdown(roomId);
```

### **4. Statistics Calculation**

```javascript
// From utils/statistics.js
export const calculateStats = (participants) => {
  const numericVotes = getNumericVotes(participants);
  
  return {
    average: calculateAverage(numericVotes),
    median: calculateMedian(numericVotes),
    mode: calculateMode(numericVotes),
    consensus: hasConsensus(numericVotes),
    spread: calculateSpread(numericVotes),
    votesCount: numericVotes.length,
    totalParticipants: countVotingParticipants(participants)
  };
};
```

#### Consensus Detection
- **Strong Consensus**: All votes identical
- **Consensus**: Votes within 1 point
- **No Consensus**: Wide spread

### **5. Email Notifications**

#### Setup (Optional on Room Creation)
```javascript
emailNotifications: {
  enabled: true,
  userEmail: "user@example.com",
  adminEmail: "kumarnarendiran2000@gmail.com" // Always notified
}
```

#### Notification Events
- Participant joins room
- Participant leaves/kicked
- Room deleted (manual or auto-cleanup)
- Role changes (promote/demote)

#### Implementation
Uses Firebase Firestore + Trigger Email Extension:
```javascript
await firestoreEmailService.notifyParticipantJoined(data, email, isAdmin);
await firestoreEmailService.notifyParticipantLeft(data, email, isAdmin);
await firestoreEmailService.notifyRoomDeleted(data, email, isAdmin);
```

### **6. Room Cleanup**

#### Auto-Cleanup Rules
- Runs on home page load
- Deletes rooms older than 4 hours
- Sends email notifications before deletion

#### Manual Cleanup
```javascript
// Check if cleanup needed (last run > 1 hour ago)
if (shouldRunCleanup()) {
  await RoomService.cleanupOldRooms();
  saveLastCleanupTime();
}
```

#### Cleanup Implementation
```javascript
const cleanupOldRooms = async () => {
  const threshold = 4 * 60 * 60 * 1000; // 4 hours
  const now = Date.now();
  
  for (const [roomId, roomData] of Object.entries(rooms)) {
    if (roomData.createdAt < now - threshold) {
      await deleteRoom(roomId, 'System Cleanup (4h+ Inactive)');
    }
  }
};
```

---

## 🎨 Styling Guidelines

### **Tailwind CSS Patterns**

#### Responsive Design
```javascript
// Mobile-first approach
className="text-sm sm:text-base md:text-lg lg:text-xl"
className="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
```

#### Color Scheme
- **Primary**: Blue (Indigo) - `bg-indigo-500`
- **Secondary**: Purple - `bg-purple-500`
- **Success**: Green - `bg-green-500`
- **Warning**: Amber/Orange - `bg-amber-500`
- **Danger**: Red - `bg-red-500`
- **Info**: Cyan - `bg-cyan-500`

#### Role Badge Colors
```javascript
// Facilitator: Orange/Amber gradient
className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700"

// Host Participant: Green/Emerald gradient
className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"

// Participant: Purple/Violet gradient
className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700"

// Current User: Blue/Cyan gradient
className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
```

#### Animation Classes
```javascript
// Smooth transitions
className="transition-all duration-200"
className="hover:scale-105 transform"

// Loading states
className="animate-pulse"
className="animate-spin"
```

### **CSS Modules**
Used for component-specific styles:
```javascript
// ParticipantList.module.css
.participantContainer { /* container styles */ }
.participantCard { /* card styles */ }
.scrollableArea { /* scrolling optimizations */ }
```

---

## 🔐 Security & Validation

### **Firebase Rules**

#### Realtime Database
```json
{
  "rules": {
    "rooms": {
      ".read": true,
      "$roomId": {
        ".write": true,
        ".validate": "$roomId.length >= 4 && $roomId.length <= 50"
      }
    }
  }
}
```

⚠️ **Note**: Current rules are permissive for development. Consider tightening for production.

#### Firestore Rules
```javascript
// Allow feedback submission
match /feedbacks/{document} {
  allow create: if true;
  allow read: if true; // For analytics
  allow update, delete: if false; // Prevent tampering
}

// Email queue for Firebase Extension
match /mail/{document} {
  allow read, write: if true;
}
```

### **Input Validation**

#### Room Creation
```javascript
// Validate name (1-50 characters)
const validateCreateRoom = (name) => {
  if (!name.trim()) return { isValid: false, error: 'Name required' };
  if (name.length > 50) return { isValid: false, error: 'Name too long' };
  return { isValid: true, error: '' };
};
```

#### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { isValid: false, error: 'Invalid email' };
}
```

---

## 🚀 Performance Optimizations

### **1. Passive Event Listeners**
Prevents scroll-blocking warnings (important for VDI):
```javascript
// main.jsx
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (['wheel', 'mousewheel', 'touchmove', 'touchstart'].includes(type)) {
    options = { ...options, passive: true };
  }
  return originalAddEventListener.call(this, type, listener, options);
};
```

### **2. Memoization**
Heavy computations are memoized:
```javascript
const sortedParticipants = useMemo(() => { /* ... */ }, [deps]);
const filteredParticipants = useMemo(() => { /* ... */ }, [deps]);
const voteDistribution = useMemo(() => { /* ... */ }, [deps]);
```

### **3. React.memo**
Prevent unnecessary re-renders:
```javascript
export default React.memo(ParticipantList);
```

### **4. Firebase Optimization**
- Cleanup listeners on unmount
- Batch operations when possible
- Use `.off()` or returned unsubscribe functions

### **5. Lazy Loading**
Email service is dynamically imported:
```javascript
const firestoreEmailService = (await import('./firestoreEmailService.js')).default;
```

---

## 🐛 Error Handling Patterns

### **Try-Catch with User Feedback**
```javascript
try {
  await RoomService.submitVote(roomId, sessionId, vote);
  enhancedToast.success('Vote submitted!');
} catch (error) {
  console.error('Error submitting vote:', error);
  enhancedToast.error(`Failed: ${error.message}`);
}
```

### **Modal Confirmations**
Use AlertModal for destructive actions:
```javascript
showConfirm({
  title: 'Delete Room',
  message: 'Are you sure? This cannot be undone.',
  okText: 'Delete',
  cancelText: 'Cancel',
  onOk: async () => {
    await deleteRoom();
  }
});
```

### **Loading States**
Always show loading during async operations:
```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing Considerations

### **Component Testing**
- Test participant sorting logic
- Test filter combinations
- Test role-based UI rendering
- Test vote state transitions

### **Integration Testing**
- Test Firebase subscription flow
- Test room creation → join → vote → reveal flow
- Test cleanup operations
- Test email notification triggers

### **Edge Cases to Test**
- Empty room (no participants)
- Room with only facilitators
- All participants skip voting
- Network disconnections
- Rapid state changes
- Kicked participant rejoining

---

## 📝 Code Style Guidelines

### **Naming Conventions**
```javascript
// Components: PascalCase
const ParticipantList = () => {};

// Hooks: camelCase with 'use' prefix
const useRoom = () => {};

// Services: PascalCase class
class RoomService {}

// Constants: UPPER_SNAKE_CASE
const FIBONACCI_SEQUENCE = [];

// Functions: camelCase
const calculateStats = () => {};
```

### **Comments**
```javascript
/**
 * JSDoc for exported functions/components
 * @param {string} roomId - The room ID
 * @returns {Promise<Object>} Room data
 */

// Inline comments for complex logic
// Sort: Current user → Facilitator → Host → Participant → Name
```

### **File Organization**
```javascript
// 1. Imports (grouped)
import React from 'react';
import { Firebase imports } from 'firebase';
import { Custom hooks } from '../hooks';
import { Utils } from '../utils';

// 2. Constants
const CONSTANT_VALUE = 'value';

// 3. Helper functions
const helperFunction = () => {};

// 4. Main component/function
const MainComponent = () => {};

// 5. PropTypes (if applicable)
MainComponent.propTypes = {};

// 6. Export
export default MainComponent;
```

---

## 🔧 Development Workflow

### **Local Setup**
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy to Firebase
pnpm deploy
```

### **Environment Variables**
Required in `.env`:
```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### **Git Workflow**
- Main branch: `main`
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

---

## 🎯 Common Tasks & Solutions

### **Adding a New Voting Option**
1. Update `FIBONACCI_SEQUENCE` in `constants.js`
2. Voting cards will auto-update
3. Statistics calculation handles any numeric value

### **Adding a New Filter**
1. Add filter to `activeFilter` state options
2. Update filter button rendering
3. Add filter logic in `filteredParticipants` useMemo
4. Update `filterCounts` calculation

### **Managing Participant Roles**
1. Access the 3-dot menu next to any participant (hosts only)
2. Choose action: Promote, Demote, Toggle Voting, or Remove
3. Confirm in modal dialog
4. Toast notification shows success/error
5. Firebase syncs role change to all clients
6. Email notifications sent automatically

### **Adding a New Email Notification**
1. Create function in `firestoreEmailService.js`
2. Add email template (HTML + text)
3. Call function in appropriate service method
4. Use fire-and-forget pattern (non-blocking)

### **Debugging Real-Time Issues**
1. Check Firebase console for data structure
2. Verify listeners are attached (useEffect)
3. Check for unsubscribe in cleanup
4. Look for race conditions in state updates
5. Verify `revealed` state before showing votes

### **Performance Issues**
1. Check for missing `useMemo` on heavy computations
2. Verify `React.memo` on frequently updated components
3. Check Firebase listener count (should cleanup)
4. Profile with React DevTools

---

## 🚨 Critical Don'ts

1. **NEVER show votes before `revealed: true`**
2. **NEVER mutate Firebase data directly** (use set/update)
3. **NEVER forget to unsubscribe from Firebase listeners**
4. **NEVER expose sensitive data in client-side code**
5. **NEVER allow participants to vote after being kicked**
6. **NEVER let facilitators vote** (isParticipant: false)
7. **NEVER skip input validation** (names, emails, room codes)
8. **NEVER ignore loading states** (show spinners/skeletons)
9. **NEVER hardcode room IDs or session IDs**
10. **NEVER remove error boundaries** (graceful degradation)

---

## 📚 Additional Resources

### **Documentation Files**
- `README.md` - Project overview and setup
- `docs/FEEDBACK_SYSTEM.md` - Feedback feature details
- `docs/RANKING_STRATEGY.md` - SEO and ranking strategy
- `docs/VDI_PERFORMANCE_GUIDE.md` - VDI optimization guide
- `docs/EMAIL_DELETION_COVERAGE.md` - Email notification coverage
- `docs/seo-setup.md` - SEO configuration

### **Firebase Extensions Used**
- **Trigger Email from Firestore** - Email notifications

### **External Dependencies**
- Firebase Console: https://console.firebase.google.com
- Tailwind CSS Docs: https://tailwindcss.com/docs
- React Docs: https://react.dev

---

## 🎓 Learning Path for New Contributors

1. **Start with** `src/App.jsx` to understand routing
2. **Explore** `src/components/Room/index.jsx` for main features
3. **Study** `src/hooks/useRoom.js` for state management pattern
4. **Review** `src/services/roomService.js` for Firebase operations
5. **Understand** `src/components/Room/ParticipantList.jsx` for complex filtering
6. **Check** `src/utils/statistics.js` for calculation logic
7. **Learn** email system from `src/services/firestoreEmailService.js`

---

## 💡 Best Practices Summary

### **React Best Practices**
- Use custom hooks for reusable logic
- Memoize expensive computations
- Use React.memo for performance
- Always cleanup side effects
- Provide loading and error states

### **Firebase Best Practices**
- Always unsubscribe from listeners
- Use transactions for atomic updates
- Implement optimistic UI updates
- Handle offline scenarios
- Validate data client and server-side

### **Code Quality**
- Write descriptive variable names
- Add JSDoc comments for exports
- Keep components focused (single responsibility)
- Extract complex logic to utils
- Use PropTypes for type checking

### **User Experience**
- Provide immediate feedback (toasts)
- Show loading states
- Confirm destructive actions
- Handle errors gracefully
- Make UI responsive (mobile-first)

---

## 🎉 Happy Coding!

This Planning Poker app prioritizes real-time collaboration, clean architecture, and excellent user experience. When in doubt:

1. **Check existing patterns** in similar components
2. **Test in Firebase Console** before implementing
3. **Consider mobile users** in your UI decisions
4. **Profile performance** if adding heavy computations
5. **Ask for clarification** rather than assuming

**Remember**: The goal is to help agile teams estimate better, not to build the most complex app. Keep it simple, fast, and reliable! 🚀
