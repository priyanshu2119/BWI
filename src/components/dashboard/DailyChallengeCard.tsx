import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Battery, Brain, Moon } from 'lucide-react';
import { Progress } from '../ui/progress';
import Button from '../ui/Button';

interface DailyChallengeCardProps {
  moodConfig: any;
  darkMode: boolean;
  challengeText: string;
  onComplete: () => void;
  isCompleted: boolean;
}

const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  moodConfig,
  darkMode,
  challengeText,
  onComplete,
  isCompleted
}) => {
  // Mock mood insights data
  const moodInsights = {
    energy: 70,
    focus: 55,
    sleep: 85
  };

  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className={`text-xl font-semibold mb-3 ${moodConfig.accentColor} flex items-center`}>
        <Calendar className="mr-2" size={20} />
        Daily Challenge
      </h2>

      <div className={`p-4 mb-4 rounded-lg bg-opacity-25 ${
        isCompleted ? 'bg-green-100 dark:bg-green-900/20' : `bg-${moodConfig.accentColor.split('-')[1]}-100 dark:bg-${moodConfig.accentColor.split('-')[1]}-900/20`
      }`}>
        <p className={`${darkMode ? 'text-white' : 'text-gray-700'}`}>
          {challengeText}
        </p>
        <div className="mt-4">
          <Button 
            onClick={onComplete}
            disabled={isCompleted}
            className={`bg-gradient-to-r ${moodConfig.buttonGradient} text-white`}
          >
            <CheckCircle size={16} className="mr-2" />
            {isCompleted ? 'Completed!' : 'Mark Complete (+10 XP)'}
          </Button>
        </div>
      </div>

      <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Today's Mood Insights
      </h3>

      {/* Energy Level */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <Battery className={`mr-1 ${moodConfig.accentColor}`} size={14} />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Energy
            </span>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {moodInsights.energy}%
          </span>
        </div>
        <Progress value={moodInsights.energy} className="h-1.5" indicatorColor={moodConfig.accentColor} />
      </div>

      {/* Focus Level */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <Brain className={`mr-1 ${moodConfig.accentColor}`} size={14} />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Focus
            </span>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {moodInsights.focus}%
          </span>
        </div>
        <Progress value={moodInsights.focus} className="h-1.5" indicatorColor={moodConfig.accentColor} />
      </div>

      {/* Sleep Quality */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <Moon className={`mr-1 ${moodConfig.accentColor}`} size={14} />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Sleep Quality
            </span>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {moodInsights.sleep}%
          </span>
        </div>
        <Progress value={moodInsights.sleep} className="h-1.5" indicatorColor={moodConfig.accentColor} />
      </div>
    </motion.div>
  );
};

export default React.memo(DailyChallengeCard);