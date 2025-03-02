import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import PlaylistCard from '../components/music/PlaylistCard';
import MusicPlayer from '../components/music/MusicPlayer';
import useStore from '../store/useStore';
import { Playlist, Track } from '../types';

const Music: React.FC = () => {
  const { playlists, darkMode } = useStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
  };
  
  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
  };
  
  return (
    <Layout>
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Mood Music
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Listen to playlists curated for different moods to help you relax, focus, or uplift your spirits.
        </motion.p>
        
        {selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <MusicPlayer
              tracks={selectedPlaylist.tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackChange={handleTrackChange}
              mood={selectedPlaylist.mood}
            />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Playlists
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => handlePlaylistSelect(playlist)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Music;