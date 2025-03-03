import React from 'react';
import { motion } from 'framer-motion';
import { Play, Music, Heart } from 'lucide-react';
import Card from '../ui/Card';
import { Playlist } from '../../types';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  isSelected?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick, isSelected = false }) => {
  const { darkMode } = useStore();
  const textColorClass = getMoodTextColor(playlist.mood, darkMode);
  
  const moodColors = {
    happy: darkMode ? ['#4ade80', '#3b82f6'] : ['#34d399', '#3b82f6'],
    sad: darkMode ? ['#60a5fa', '#3b82f6'] : ['#93c5fd', '#3b82f6'],
    neutral: darkMode ? ['#a8a29e', '#78716c'] : ['#d6d3d1', '#78716c'],
    anxious: darkMode ? ['#fcd34d', '#f59e0b'] : ['#fcd34d', '#f59e0b']
  };
  
  const colors = moodColors[playlist.mood as keyof typeof moodColors] || 
                ['#818cf8', '#6366f1'];
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="h-full"
    >
      <Card className={`cursor-pointer h-full relative overflow-hidden ${isSelected ? 'ring-2' : ''}`} style={{
        ringColor: colors[0]
      }}>
        <div className="relative">
          <img 
            src={playlist.coverImage} 
            alt={playlist.title} 
            className="w-full h-40 object-cover rounded-lg"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`bg-white bg-opacity-20 p-3 rounded-full backdrop-blur-sm`}
            >
              <Play size={24} className="text-white" />
            </motion.div>
          </div>
          
          {/* Animated gradient overlay */}
          <motion.div 
            className="absolute inset-0 rounded-lg mix-blend-overlay opacity-70"
            style={{
              background: `linear-gradient(135deg, ${colors[0]}66, ${colors[1]}66)`,
              boxShadow: `inset 0 0 30px ${colors[0]}33`
            }}
            animate={{
              opacity: [0.5, 0.7, 0.5],
              background: [
                `linear-gradient(135deg, ${colors[0]}66, ${colors[1]}66)`,
                `linear-gradient(225deg, ${colors[0]}66, ${colors[1]}66)`,
                `linear-gradient(135deg, ${colors[0]}66, ${colors[1]}66)`
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          />
          
          {/* Playing indicator for currently selected playlist */}
          {isSelected && (
            <motion.div 
              className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75`} style={{ backgroundColor: colors[0] }}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3`} style={{ backgroundColor: colors[0] }}></span>
              </span>
            </motion.div>
          )}
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Music size={16} className={textColorClass} />
              <span className={`ml-1 text-xs font-medium ${textColorClass}`}>
                {playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)} Mood
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Heart size={16} />
            </motion.button>
          </div>
          
          <h3 className={`text-lg font-semibold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {playlist.title}
          </h3>
          
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex justify-between items-center`}>
            <span>{playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}</span>
            {playlist.tracks.length > 0 && (
              <span className="text-xs opacity-70">
                {Math.floor(Math.random() * 30) + 10} min
              </span>
            )}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default PlaylistCard;