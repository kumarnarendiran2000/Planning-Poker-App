import { firestore } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';

/**
 * Service for managing room round history in Firestore.
 * Collection path: roomHistory/{roomId}/rounds/{auto-id}
 */
const historyService = {
  /**
   * Save a completed round to Firestore.
   * @param {string} roomId
   * @param {Object} data - { story, participants, stats }
   */
  async saveRound(roomId, { story, participants, stats }) {
    const roundsRef = collection(firestore, 'roomHistory', roomId, 'rounds');

    // Collect votes from all voting participants (exclude facilitators)
    const votes = {};
    Object.values(participants || {}).forEach((p) => {
      if (p.isParticipant !== false) {
        votes[p.name] = p.vote ?? null;
      }
    });

    return addDoc(roundsRef, {
      story: story?.trim() || '(No story entered)',
      votes,
      stats: {
        average: stats?.average ?? null,
        median: stats?.median ?? null,
        min: stats?.min ?? null,
        max: stats?.max ?? null,
        count: stats?.count ?? null,
        total: stats?.total ?? null,
      },
      timestamp: Date.now(),
    });
  },

  /**
   * Fetch all rounds for a room, ordered by timestamp ascending.
   * @param {string} roomId
   * @returns {Promise<Array>}
   */
  async getRounds(roomId) {
    const roundsRef = collection(firestore, 'roomHistory', roomId, 'rounds');
    const q = query(roundsRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Delete all history rounds for a room (called when room is deleted).
   * @param {string} roomId
   */
  async deleteRoomHistory(roomId) {
    const roundsRef = collection(firestore, 'roomHistory', roomId, 'rounds');
    const snapshot = await getDocs(roundsRef);
    if (snapshot.empty) return;
    await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
  },
};

export default historyService;
