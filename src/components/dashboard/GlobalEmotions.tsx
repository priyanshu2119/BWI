import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

const GlobalEmotions: React.FC = () => {
  const { globalEmotions, sendHeartToGlobalEmotion, darkMode } = useStore();
  
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };
  
  return (
    <Card className="h-full">
      <div className="max-h-80 overflow-y-auto pr-2">
        {globalEmotions.map(emotion => (
          <motion.div
            key={emotion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <MapPin size={16} className="mt-1 mr-2 text-gray-400" />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Someone in <span className="font-medium">{emotion.location}</span> feels{' '}
                    <span className={getMoodTextColor(emotion.mood, darkMode)}>
                      {emotion.mood}
                    </span>
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTime(emotion.timestamp)}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => sendHeartToGlobalEmotion(emotion.id)}
                className="flex items-center text-gray-400 hover:text-red-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={16} className={emotion.hearts > 0 ? 'text-red-500' : ''} />
                {emotion.hearts > 0 && (
                  <span className="ml-1 text-xs font-medium">
                    {emotion.hearts}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default GlobalEmotions;