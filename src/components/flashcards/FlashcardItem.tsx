import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MotivationalFlashcard } from '../../types';

interface FlashcardItemProps {
  card: MotivationalFlashcard;
  onComplete: () => void;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ card, onComplete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  return (
    <div className="perspective-1000 w-full h-64 cursor-pointer" onClick={handleFlip}>
      <motion.div
        className="relative w-full h-full transition-all duration-500 preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Front of card */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl p-6 flex flex-col items-center justify-center text-white text-center ${card.color}`}
        >
          <h3 className="text-2xl font-bold mb-4">{card.frontText}</h3>
          <p className="text-sm">Tap to flip</p>
        </motion.div>
        
        {/* Back of card */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl p-6 flex flex-col items-center justify-center text-white text-center ${card.color} rotateY-180`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-xl mb-6">{card.backText}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FlashcardItem;