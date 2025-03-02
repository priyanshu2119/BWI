import React from 'react';
import { Flame, Award, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import ProgressCircle from '../ui/ProgressCircle';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

const UserStats: React.FC = () => {
  const { user, currentMood, darkMode } = useStore();
  
  const textColorClass = getMoodTextColor(currentMood, darkMode);
  const xpForNextLevel = 100;
  const progress = (user.xp % xpForNextLevel) / xpForNextLevel * 100;
  
  return (
    <Card className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Your Progress
          </h3>
          
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full mx-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <TrendingUp className={textColorClass} size={20} />
              </div>
              <p className={`mt-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Level {user.level}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full mx-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Flame className={textColorClass} size={20} />
              </div>
              <p className={`mt-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {user.streak} Day Streak
              </p>
            </div>
            
            <div className="text-center">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full mx-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Award className={textColorClass} size={20} />
              </div>
              <p className={`mt-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {user.badges.filter(b => b.unlocked).length} Badges
              </p>
            </div>
          </div>
        </div>
        
        <ProgressCircle progress={progress} size={100}>
          <div className="text-center">
            <p className={`text-2xl font-bold ${textColorClass}`}>{user.xp % xpForNextLevel}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>/ {xpForNextLevel} XP</p>
          </div>
        </ProgressCircle>
      </div>
    </Card>
  );
};

export default UserStats;