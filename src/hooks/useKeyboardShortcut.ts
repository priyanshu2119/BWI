import { useEffect } from 'react';

type KeyHandler = () => void;
type KeyMap = Record<string, KeyHandler>;

/**
 * Custom hook for handling keyboard shortcuts
 * @param keyMap Object mapping key combinations to handler functions
 * @param deps Optional dependency array to control when listeners are attached
 */
const useKeyboardShortcut = (keyMap: KeyMap, deps: React.DependencyList = []) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Create a normalized key representation
      const key = event.key.toLowerCase();
      
      // Check if we have a handler for this key
      const handler = keyMap[key];
      
      // Additional check for special combinations like Space, ArrowLeft, etc.
      if (handler) {
        // Prevent default behavior for navigation keys
        if (['space', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
          event.preventDefault();
        }
        handler();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, deps);
};

export default useKeyboardShortcut;