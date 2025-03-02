import React from 'react';
import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';
import Card from '../ui/Card';
import { Playlist } from '../../types';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { darkMode } = useStore();
  const textColorClass = getMoodTextColor(playlist.mood, darkMode);
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Card className="cursor-pointer h-full">
        <div className="relative">
          <img 
            src={playlist.coverImage} 
            alt={playlist.title} 
            className="w-full h-40 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-white bg-opacity-20 p-3 rounded-full"
            >
              <Play size={24} className="text-white" />
            </motion.div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex items-center">
            <Music size={16} className={textColorClass} />
            <span className={`ml-1 text-xs font-medium ${textColorClass}`}>
              {playlist.mood.charAt(0).toUpperCase() + playlist.mood.slice(1)} Mood
            </span>
          </div>
          
          <h3 className={`text-lg font-semibold mt-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {playlist.title}
          </h3>
          
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default PlaylistCard;