import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import useStore from '../../store/useStore';
import { getMoodGradient } from '../../utils/theme';
import Confetti from 'react-confetti';
import EmergencyHelpButton from '../emergency/EmergencyHelpButton';
import MotivationalFlashcards from '../flashcards/MotivationalFlashcards';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentMood, darkMode, showConfetti, setShowConfetti, showFlashcards } = useStore();
  
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti, setShowConfetti]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Navbar />
      
      <motion.div
        className={`pt-16 min-h-screen ${getMoodGradient(currentMood, darkMode)}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showFlashcards && <MotivationalFlashcards />}
          {children}
        </main>
      </motion.div>
      
      <EmergencyHelpButton />
    </div>
  );
};

export default Layout;