import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import Card from '../ui/Card';
import { Track } from '../../types';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

interface MusicPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  mood: 'sad' | 'neutral' | 'happy';
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  currentTrackIndex,
  onTrackChange,
  mood
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { darkMode } = useStore();
  
  const currentTrack = tracks[currentTrackIndex];
  const textColorClass = getMoodTextColor(mood, darkMode);
  
  useEffect(() => {
    // Reset player state when track changes
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Small delay to allow audio element to update
    const timer = setTimeout(() => {
      if (isPlaying && audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentTrackIndex]);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handlePrevious = () => {
    const newIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    onTrackChange(newIndex);
  };
  
  const handleNext = () => {
    const newIndex = currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1;
    onTrackChange(newIndex);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card variant="glass" className="p-6">
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="mb-4 md:mb-0">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {currentTrack.title}
          </h3>
          <p className={`text-sm ${textColorClass}`}>
            {currentTrack.artist}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <SkipBack size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </motion.button>
          
          <motion.button
            onClick={togglePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full ${textColorClass.replace('text', 'bg').replace('-600', '-100').replace('-400', '-900')} ${textColorClass}`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <SkipForward size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          </motion.button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={`w-full mx-2 h-2 rounded-full appearance-none cursor-pointer ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, ${
                mood === 'sad' ? (darkMode ? '#818cf8' : '#6366f1') : 
                mood === 'neutral' ? (darkMode ? '#60a5fa' : '#3b82f6') : 
                (darkMode ? '#34d399' : '#10b981')
              } ${(currentTime / (duration || 1)) * 100}%, ${
                darkMode ? '#374151' : '#e5e7eb'
              } 0)`,
            }}
          />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center">
        <button onClick={toggleMute} className="mr-2">
          {isMuted ? (
            <VolumeX size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          ) : (
            <Volume2 size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className={`w-24 h-1.5 rounded-full appearance-none cursor-pointer ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
          style={{
            background: `linear-gradient(to right, ${
              darkMode ? '#9ca3af' : '#6b7280'
            } ${(isMuted ? 0 : volume) * 100}%, ${
              darkMode ? '#374151' : '#e5e7eb'
            } 0)`,
          }}
        />
      </div>
    </Card>
  );
};

export default MusicPlayer;