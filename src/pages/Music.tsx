import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Smile, Frown, Meh, Music as MusicIcon, Heart, Play } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PlaylistCard from '../components/music/PlaylistCard';
import MusicPlayer from '../components/music/MusicPlayer';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { Playlist, Track, Mood } from '../types';

const Music: React.FC = () => {
  const { playlists, darkMode, currentMood } = useStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | 'all'>(currentMood || 'all');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Filter playlists by selected mood
  const filteredPlaylists = selectedMood === 'all' 
    ? playlists 
    : playlists.filter(playlist => playlist.mood === selectedMood);
    
  // Get recommended playlists based on current mood
  const recommendedPlaylists = currentMood 
    ? playlists.filter(playlist => playlist.mood === currentMood).slice(0, 3)
    : playlists.slice(0, 3);
  
  // Handle initial state if there's a current mood
  useEffect(() => {
    if (currentMood && !selectedPlaylist && recommendedPlaylists.length > 0) {
      setSelectedMood(currentMood);
    }
  }, [currentMood]);
  
  const handlePlaylistSelect = (playlist: Playlist) => {
    // If selecting the same playlist, just keep playing
    if (selectedPlaylist?.id === playlist.id) return;
    
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
  };
  
  const handleTrackChange = (index: number) => {
    setCurrentTrackIndex(index);
  };
  
  const handleMoodSelect = (mood: Mood | 'all') => {
    setSelectedMood(mood);
    setCarouselIndex(0);
  };
  
  const scrollCarousel = (direction: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    
    const itemWidth = 300; // Approximate width of a playlist card with margins
    const containerWidth = carouselRef.current.offsetWidth;
    const itemsPerPage = Math.max(1, Math.floor(containerWidth / itemWidth));
    const maxIndex = Math.max(0, filteredPlaylists.length - itemsPerPage);
    
    if (direction === 'prev') {
      setCarouselIndex(Math.max(0, carouselIndex - 1));
    } else {
      setCarouselIndex(Math.min(maxIndex, carouselIndex + 1));
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const moodIcons = {
    happy: <Smile className="mr-2" size={18} />,
    sad: <Frown className="mr-2" size={18} />,
    neutral: <Meh className="mr-2" size={18} />,
    anxious: <MusicIcon className="mr-2" size={18} />,
    all: <MusicIcon className="mr-2" size={18} />
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 pb-20">
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
        
        {/* Mood Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Filter by mood
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'happy', 'neutral', 'sad', 'anxious'] as const).map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => handleMoodSelect(mood)}
                className={selectedMood === mood ? 
                  mood === 'happy' ? 'bg-green-500 hover:bg-green-600' : 
                  mood === 'sad' ? 'bg-blue-500 hover:bg-blue-600' :
                  mood === 'anxious' ? 'bg-amber-500 hover:bg-amber-600' :
                  mood === 'neutral' ? 'bg-gray-500 hover:bg-gray-600' : ''
                  : ''}
              >
                {moodIcons[mood]}
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>
        
        {/* Recommendations based on user's current mood */}
        {currentMood && recommendedPlaylists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Recommended for your {currentMood} mood
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPlaylists.map(playlist => (
                <motion.div 
                  key={playlist.id}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlaylistCard
                    playlist={playlist}
                    onClick={() => handlePlaylistSelect(playlist)}
                    isSelected={selectedPlaylist?.id === playlist.id}
                  />
                  
                  {selectedPlaylist?.id === playlist.id && (
                    <motion.div 
                      className={`mt-2 text-sm text-center ${darkMode ? 'text-purple-400' : 'text-purple-600'} font-medium`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Now Playing
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Current Player */}
        <AnimatePresence mode="wait">
          {selectedPlaylist && (
            <motion.div
              key={selectedPlaylist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <MusicPlayer
                tracks={selectedPlaylist.tracks}
                currentTrackIndex={currentTrackIndex}
                onTrackChange={handleTrackChange}
                mood={selectedPlaylist.mood}
                playlistTitle={selectedPlaylist.title}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Carousel Playlist Browser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {selectedMood === 'all' ? 'All Playlists' : `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Playlists`}
            </h2>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollCarousel('prev')}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'} 
                  ${carouselIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={carouselIndex === 0}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollCarousel('next')}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}
                  ${carouselIndex >= filteredPlaylists.length - 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={carouselIndex >= filteredPlaylists.length - 3}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>
          
          {filteredPlaylists.length > 0 ? (
            <div className="relative overflow-hidden">
              <motion.div
                ref={carouselRef}
                className="flex gap-6"
                initial={{ x: 0 }}
                animate={{ x: -carouselIndex * 310 }} // Width of card + gap
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {filteredPlaylists.map((playlist) => (
                  <motion.div 
                    key={playlist.id}
                    className="w-[280px] flex-shrink-0"
                    whileHover={{ 
                      y: -10, 
                      transition: { duration: 0.2 }
                    }}
                  >
                    <PlaylistCard 
                      playlist={playlist} 
                      onClick={() => handlePlaylistSelect(playlist)}
                      isSelected={selectedPlaylist?.id === playlist.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Carousel Indicators */}
              {filteredPlaylists.length > 3 && (
                <div className="flex justify-center mt-4 gap-2">
                  {[...Array(Math.ceil(filteredPlaylists.length / 3))].map((_, i) => (
                    <motion.button 
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        Math.floor(carouselIndex / 3) === i 
                          ? darkMode ? 'bg-purple-400' : 'bg-purple-600'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                      onClick={() => setCarouselIndex(i * 3)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <MusicIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No playlists found for this mood.</p>
              <Button 
                onClick={() => setSelectedMood('all')} 
                className="mt-4" 
                variant="outline"
              >
                View all playlists
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Music;