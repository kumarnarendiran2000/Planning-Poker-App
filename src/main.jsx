import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add passive event listeners globally to prevent scroll-blocking warnings
// This is especially important for VDI environments where scroll performance matters
const addPassiveEventListeners = () => {
  const options = { passive: true };
  
  // Override default event listener behavior for common scroll events
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Make wheel and touch events passive by default for better performance
    if (type === 'wheel' || type === 'mousewheel' || type === 'touchmove' || type === 'touchstart') {
      if (typeof options === 'boolean') {
        options = { passive: true, capture: options };
      } else if (typeof options === 'object' && options !== null) {
        options = { ...options, passive: true };
      } else {
        options = { passive: true };
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// Apply passive event listeners globally
addPassiveEventListeners();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
