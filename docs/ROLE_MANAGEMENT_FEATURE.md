# Role Management Feature

## 🎯 Overview

This document describes the **role management feature** that allows hosts to dynamically promote/demote participants and manage their voting privileges in real-time.

---

## ✨ Features Implemented

### **1. Interactive Participant Menu**
- **3-dot menu icon** appears next to each participant (visible only to hosts)
- **Dropdown menu** with contextual actions based on participant's current role
- **Click outside to close** - clean UX interaction
- **Disabled for current user** - hosts cannot change their own role

### **2. Role Management Actions**

#### For Regular Participants
- ⬆️ **Promote to Host Participant** - Give host privileges with voting rights
- 👁️ **Promote to Facilitator** - Give host privileges without voting (observer)
- 🗑️ **Remove from Room** - Kick participant

#### For Existing Hosts
- ✅/🚫 **Toggle Voting Status** - Enable/disable voting for hosts
  - Host Participant → Facilitator (disable voting)
  - Facilitator → Host Participant (enable voting)
- ⬇️ **Demote to Participant** - Remove host privileges
- 🗑️ **Remove from Room** - Kick participant

---

## 🔧 Technical Implementation

### **Backend (Already Existed)**
```javascript
// In src/services/roomService.js

// Promote participant to host
RoomService.promoteToHost(roomId, participantId, canVote, promotedBy)

// Demote host to participant
RoomService.demoteFromHost(roomId, participantId, demotedBy)

// Toggle voting status
RoomService.toggleVotingStatus(roomId, participantId, canVote, changedBy)

// Generic role update
RoomService.updateParticipantRole(roomId, participantId, roleUpdate, changedBy)
```

### **Frontend (Newly Implemented)**

#### Room Component (src/components/Room/index.jsx)
```javascript
// New handlers added:
- handlePromoteToHost(participantId, participantName, canVote)
- handleDemoteFromHost(participantId, participantName)
- handleToggleVoting(participantId, participantName, currentCanVote)

// All use AlertModal for confirmations (no JavaScript alerts)
// All show toast notifications for user feedback
```

#### RoomMainContent Component
```javascript
// Props passed through to ParticipantList:
- onPromoteToHost
- onDemoteFromHost
- onToggleVoting
```

#### ParticipantList Component (src/components/Room/ParticipantList.jsx)
```javascript
// State added:
const [openMenuId, setOpenMenuId] = useState(null); // Track open dropdown

// Features:
- 3-dot menu button for each participant
- Contextual dropdown menu with role actions
- Click outside to close functionality
- Conditional rendering based on current role
```

---

## 🎨 User Experience

### **Visual Design**
- **Menu Icon**: 3-dot vertical icon (ellipsis)
- **Hover State**: Gray background on hover
- **Dropdown**: White card with shadow, rounded corners
- **Action Items**: Icon + Title + Description format
- **Color Coding**:
  - Green: Promote actions
  - Orange: Facilitator actions
  - Blue: Toggle voting
  - Purple: Demote actions
  - Red: Remove actions

### **Interaction Flow**
1. **Host clicks 3-dot menu** → Dropdown opens
2. **Host selects action** → Dropdown closes
3. **Modal confirmation appears** → Clear title and message
4. **Host confirms** → Action executes
5. **Toast notification shows** → Success/error feedback with emoji
6. **Firebase syncs** → All clients see role change immediately
7. **Email sent** (if enabled) → Participant and admin notified

### **Feedback Messages**
```javascript
// Success examples:
"John Doe is now a Host Participant! 🎉"
"Jane Smith is now a Facilitator! 🎉"
"Bob can now vote"
"Alice can no longer vote"
"Mike is now a regular participant"

// Error examples:
"Failed to promote: [error message]"
"Failed to demote: [error message]"
```

---

## 🔒 Security & Permissions

### **Authorization**
- Only **hosts** can manage roles (isHost: true)
- Hosts **cannot change their own role** (prevent self-lockout)
- Actions are **validated in handlers** before calling service
- Host name is **passed to backend** for audit trail

### **Firebase Updates**
- Role changes update participant data in Firebase
- `roleUpdatedAt` timestamp recorded
- `roleUpdatedBy` field stores who made the change
- Real-time listeners propagate changes to all clients

### **Email Notifications**
- Automatic email sent on role changes (if enabled)
- Admin always receives notifications
- Room creator receives if opted in
- Email includes: room code, participant name, new role, changed by, timestamp

---

## 📊 Data Structure

### **Firebase Participant Object**
```javascript
participants/
  {sessionId}/
    name: "John Doe"
    vote: "5" | "SKIP" | null
    isHost: true | false
    isParticipant: true | false
    joinedAt: 1699000000000
    roleUpdatedAt: 1699000100000  // NEW
    roleUpdatedBy: "Jane Smith"   // NEW
    kicked: null | { timestamp: number, by: string }
```

### **Role Combinations**
```javascript
// Regular Participant
{ isHost: false, isParticipant: true }

// Host Participant (can vote)
{ isHost: true, isParticipant: true }

// Facilitator (cannot vote)
{ isHost: true, isParticipant: false }
```

---

## 🧪 Testing Scenarios

### **Test Case 1: Promote Regular Participant**
1. Host opens participant menu
2. Clicks "Promote to Host Participant"
3. Confirms in modal
4. Participant becomes host with voting rights
5. Badge changes from "Participant" to "Host Participant"
6. Toast shows success message

### **Test Case 2: Toggle Voting for Host**
1. Host opens menu for another host
2. Clicks "Disable Voting"
3. Confirms in modal
4. Host becomes facilitator (observer)
5. Badge changes to "Facilitator"
6. Cannot vote anymore

### **Test Case 3: Demote Host to Participant**
1. Host opens menu for another host
2. Clicks "Demote to Participant"
3. Confirms in modal
4. Loses host privileges
5. Badge changes to "Participant"
6. Can still vote

### **Test Case 4: Multiple Hosts Managing Roles**
1. Room has 2 hosts
2. Both can promote/demote participants
3. Changes sync in real-time
4. No conflicts or race conditions

### **Test Case 5: Self-Management Prevention**
1. Host clicks their own 3-dot menu
2. Menu **does not appear**
3. Cannot demote self

---

## 🚀 Future Enhancements

### **Potential Improvements**
1. **Role History** - Track all role changes with timestamps
2. **Bulk Actions** - Select multiple participants for role changes
3. **Role Templates** - Predefined role configurations
4. **Permission Levels** - More granular permissions beyond host/participant
5. **Role Change Notifications** - In-app notifications for affected users
6. **Undo/Redo** - Ability to revert role changes
7. **Role Analytics** - Dashboard showing role distribution over time

### **Performance Optimizations**
1. Debounce menu open/close to prevent rapid toggling
2. Lazy load role history data
3. Cache participant role state for faster UI updates

---

## 📝 Code Examples

### **Complete Handler Example**
```javascript
const handlePromoteToHost = useCallback(async (participantId, participantName, canVote) => {
  if (!isHost || !roomId) return;
  
  const roleType = canVote ? 'Host Participant (with voting)' : 'Facilitator (observer only)';
  
  showConfirm({
    title: 'Promote to Host',
    message: `Promote ${participantName} to ${roleType}?`,
    okText: 'Promote',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        const hostName = participants[sessionId]?.name || 'Host';
        await RoomService.promoteToHost(roomId, participantId, canVote, hostName);
        enhancedToast.success(`${participantName} is now a ${canVote ? 'Host Participant' : 'Facilitator'}! 🎉`);
      } catch (error) {
        console.error('Error promoting participant:', error);
        enhancedToast.error(`Failed to promote: ${error.message}`);
      }
    }
  });
}, [isHost, roomId, participants, sessionId, showConfirm]);
```

### **Dropdown Menu Example**
```jsx
<div className="relative participant-menu">
  <button onClick={() => setOpenMenuId(participant.id)}>
    <svg>...</svg> {/* 3-dot icon */}
  </button>
  
  {openMenuId === participant.id && (
    <div className="dropdown-menu">
      {!participant.isHost ? (
        <>
          <button onClick={() => onPromoteToHost(id, name, true)}>
            Promote to Host Participant
          </button>
          <button onClick={() => onPromoteToHost(id, name, false)}>
            Make Facilitator
          </button>
        </>
      ) : (
        <>
          <button onClick={() => onToggleVoting(id, name, canVote)}>
            Toggle Voting Status
          </button>
          <button onClick={() => onDemoteFromHost(id, name)}>
            Demote to Participant
          </button>
        </>
      )}
      <button onClick={() => onRemoveParticipant(id, name)}>
        Remove from Room
      </button>
    </div>
  )}
</div>
```

---

## 🎓 Best Practices

### **Do's**
✅ Always use AlertModal for confirmations (never JavaScript alerts)
✅ Provide clear toast notifications with emojis
✅ Close dropdown menu before executing action
✅ Pass host name to backend for audit trail
✅ Handle errors gracefully with user-friendly messages
✅ Disable menu for current user (prevent self-lockout)

### **Don'ts**
❌ Don't use JavaScript `alert()`, `confirm()`, or `prompt()`
❌ Don't allow hosts to change their own role
❌ Don't forget to close the dropdown after action
❌ Don't skip error handling
❌ Don't block UI during role changes (async operations)
❌ Don't mutate Firebase data directly (use RoomService methods)

---

## 📚 Related Documentation

- `src/services/roomService.js` - Backend role management methods
- `src/components/Room/index.jsx` - Handler implementations
- `src/components/Room/ParticipantList.jsx` - UI implementation
- `src/components/modals/AlertModal.jsx` - Confirmation modal component
- `src/utils/enhancedToast.jsx` - Toast notification utilities
- `.github/copilot-instructions.md` - Full project documentation

---

## 🎉 Summary

The role management feature provides hosts with **comprehensive control** over participant roles while maintaining **excellent UX** through:

- 🎨 **Intuitive UI** - Clear menus and actions
- ✅ **Safe Confirmations** - No accidental changes
- 📢 **Rich Feedback** - Toast notifications and emails
- ⚡ **Real-time Sync** - Instant updates across all clients
- 🔒 **Secure** - Proper authorization and validation

This feature enables **flexible team management** for agile estimation sessions, allowing hosts to adapt roles as needed without disrupting the flow! 🚀
