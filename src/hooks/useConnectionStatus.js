import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase/config';

/**
 * Hook that tracks Firebase RTDB connection state via .info/connected.
 * Returns { isOnline } — false means connection is lost/reconnecting.
 */
const useConnectionStatus = () => {
  // Start as true to avoid flashing the banner on initial load
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const connectedRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsOnline(snapshot.val() === true);
    });
    return () => unsubscribe();
  }, []);

  return { isOnline };
};

export default useConnectionStatus;
