import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 2000 
}) => {
  const { currentMood, darkMode } = useStore();
  const textColorClass = getMoodTextColor(currentMood, darkMode);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: [1, 1.1, 1],
      opacity: 1,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const progressVariants = {
    initial: { width: "0%" },
    animate: { 
      width: "100%",
      transition: { 
        duration: duration / 1000,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={pulseVariants}
        className={`mb-8 ${textColorClass}`}
      >
        <Brain size={80} />
      </motion.div>
      
      <motion.h1
        variants={itemVariants}
        className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
      >
        Student Mental Health Hub
      </motion.h1>
      
      <motion.p
        variants={itemVariants}
        className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
      >
        Loading your personalized experience...
      </motion.p>
      
      <motion.div
        variants={itemVariants}
        className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      >
        <motion.div
          variants={progressVariants}
          className={`h-full ${textColorClass.replace('text', 'bg')}`}
        />
      </motion.div>
      
      <motion.div
        variants={itemVariants}
        className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
      >
        Preparing your wellness journey
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;