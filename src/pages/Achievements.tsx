import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import BadgeCard from '../components/achievements/BadgeCard';
import ProgressCircle from '../components/ui/ProgressCircle';
import useStore from '../store/useStore';

const Achievements: React.FC = () => {
  const { user, darkMode } = useStore();
  
  const xpForNextLevel = 100;
  const progress = (user.xp % xpForNextLevel) / xpForNextLevel * 100;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Achievements
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Track your progress and earn badges as you take care of your mental health.
        </motion.p>
        
        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Your Progress
              </h2>
              
              <div className="flex items-center">
                <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Level {user.level}
                </div>
                
                <div className={`ml-4 px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                  {user.xp} XP Total
                </div>
              </div>
              
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {xpForNextLevel - (user.xp % xpForNextLevel)} XP until next level
              </p>
            </div>
            
            <ProgressCircle progress={progress} size={120}>
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {Math.round(progress)}%
                </p>
              </div>
            </ProgressCircle>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Badges
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.badges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Achievements;