import React from 'react';
import { motion } from 'framer-motion';
import { Award, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';
import { getMoodTextColor, getMoodBasedChallenge } from '../../utils/theme';

const DailyChallenge: React.FC = () => {
  const { dailyChallenge, completeChallenge, currentMood, darkMode } = useStore();
  
  const textColorClass = getMoodTextColor(currentMood, darkMode);
  
  // Get a mood-based challenge description
  const challengeDescription = getMoodBasedChallenge(currentMood);
  
  return (
    <Card className="w-full">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Award className={`mr-2 ${textColorClass}`} size={24} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Daily Challenge
          </h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
          +{dailyChallenge.xpReward} XP
        </div>
      </div>
      
      <h4 className={`mt-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
        {dailyChallenge.title}
      </h4>
      
      <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {challengeDescription}
      </p>
      
      <div className="mt-4">
        {dailyChallenge.completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center justify-center p-2 rounded-lg ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}
          >
            <Check size={18} className="mr-2" />
            <span>Completed!</span>
          </motion.div>
        ) : (
          <Button 
            onClick={completeChallenge}
            fullWidth
            icon={<Check size={18} />}
          >
            Mark as Complete
          </Button>
        )}
      </div>
    </Card>
  );
};

export default DailyChallenge;