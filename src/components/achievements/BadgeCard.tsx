import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Badge } from '../../types';
import useStore from '../../store/useStore';
import * as LucideIcons from 'lucide-react';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const { darkMode } = useStore();
  
  // Dynamically get the icon from lucide-react
  const IconComponent = (LucideIcons as any)[badge.icon] || LucideIcons.Award;
  
  return (
    <Card variant={badge.unlocked ? 'neumorphic' : 'default'} className="h-full">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className={`p-4 rounded-full mb-3 ${
            badge.unlocked
              ? darkMode
                ? 'bg-purple-900 text-purple-200'
                : 'bg-purple-100 text-purple-600'
              : darkMode
                ? 'bg-gray-800 text-gray-500'
                : 'bg-gray-200 text-gray-400'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <IconComponent size={32} />
        </motion.div>
        
        <h3 className={`text-lg font-semibold ${
          badge.unlocked
            ? darkMode ? 'text-gray-100' : 'text-gray-800'
            : darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {badge.name}
        </h3>
        
        <p className={`text-sm mt-1 ${
          badge.unlocked
            ? darkMode ? 'text-gray-300' : 'text-gray-600'
            : darkMode ? 'text-gray-600' : 'text-gray-500'
        }`}>
          {badge.description}
        </p>
        
        {!badge.unlocked && (
          <div className={`mt-3 text-xs px-2 py-1 rounded-full ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
          }`}>
            Locked
          </div>
        )}
      </div>
    </Card>
  );
};

export default BadgeCard;