import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';
import FlashcardItem from './FlashcardItem';

const MotivationalFlashcards: React.FC = () => {
  const { flashcards, currentMood, setShowFlashcards } = useStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Filter flashcards based on current mood
  const moodFlashcards = flashcards.filter(card => card.mood === currentMood);
  const currentCard = moodFlashcards[currentCardIndex] || flashcards[0];
  
  useEffect(() => {
    // Auto-close flashcards after 15 seconds
    const timer = setTimeout(() => {
      setShowFlashcards(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [setShowFlashcards]);
  
  const handleNext = () => {
    if (currentCardIndex < moodFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setShowFlashcards(false);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={() => setShowFlashcards(false)}
      >
        <motion.div
          className="relative max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowFlashcards(false)}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
          >
            <X size={20} />
          </button>
          
          <FlashcardItem 
            card={currentCard} 
            onComplete={handleNext}
          />
          
          <div className="mt-4 flex justify-center">
            {moodFlashcards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${
                  index === currentCardIndex 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MotivationalFlashcards;