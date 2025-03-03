import React from 'react';
import { motion } from 'framer-motion';
import { Award, BarChart, CheckCircle } from 'lucide-react';
import { Progress } from '../ui/progress';

interface Achievement {
  id: number;
  name: string;
  icon: React.ReactNode;
}

interface ProgressPanelProps {
  moodConfig: any;
  darkMode: boolean;
  user: any;
  completedTasks: number;
  totalTasks: number;
  achievements: Achievement[];
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
  moodConfig,
  darkMode,
  user,
  completedTasks,
  totalTasks,
  achievements
}) => {
  // XP level calculation (example implementation)
  const currentXP = user?.xp || 350;
  const nextLevelXP = 500;
  const xpPercentage = (currentXP / nextLevelXP) * 100;
  const currentLevel = user?.level || 5;
  const streakDays = user?.streak || 7;

  // Mock data for streak
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Award className={`mr-2 ${moodConfig.accentColor}`} size={22} />
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Progress
        </h2>
      </div>

      {/* XP and Level */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Level {currentLevel}
          </span>
          <span className={`text-sm ${moodConfig.accentColor}`}>
            {currentXP}/{nextLevelXP} XP
          </span>
        </div>
        <Progress 
          value={xpPercentage} 
          className="h-2" 
          indicatorColor={moodConfig.accentColor} 
        />
      </div>

      {/* Streak */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            7-Day Streak
          </span>
          <span className={`text-sm font-medium ${moodConfig.accentColor}`}>
            {streakDays} days
          </span>
        </div>
        <div className="flex justify-between">
          {weekDays.map((day, index) => {
            const isActive = index < streakDays;
            return (
              <div 
                key={day} 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive 
                    ? `bg-${moodConfig.accentColor.split('-')[1]}-500 text-white` 
                    : `bg-${moodConfig.accentColor.split('-')[1]}-100/30 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Daily Tasks
          </span>
          <span className={`text-sm font-medium ${moodConfig.accentColor}`}>
            {completedTasks}/{totalTasks} Completed
          </span>
        </div>
        <Progress 
          value={(completedTasks / totalTasks) * 100} 
          className="h-2" 
          indicatorColor={moodConfig.accentColor} 
        />
      </div>

      {/* Achievements */}
      <div>
        <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Recent Achievements
        </h3>
        <div className="space-y-2">
          {achievements.map(achievement => (
            <motion.div
              key={achievement.id}
              className={`flex items-center p-2 rounded-lg bg-${moodConfig.accentColor.split('-')[1]}-100/20`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`p-1.5 mr-3 rounded-full bg-${moodConfig.accentColor.split('-')[1]}-500/20`}>
                {achievement.icon}
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {achievement.name}
              </span>
              <CheckCircle 
                size={14} 
                className={`ml-auto ${moodConfig.accentColor}`} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProgressPanel);