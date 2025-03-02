import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Trash2, Play, Pause, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const VentBox: React.FC = () => {
  const { user, addVentBoxRecording, deleteVentBoxRecording, darkMode } = useStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };
  
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    
    // In a real app, we would save the actual recording
    // For this demo, we'll just save the duration
    if (recordingTime > 0) {
      addVentBoxRecording(recordingTime);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'PPp');
  };

  const togglePlayPause = (recordingId: string) => {
    if (currentPlayingId === recordingId) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Logic for playing a different recording
      setCurrentPlayingId(recordingId);
      setIsPlaying(true);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Vent Box
        </h1>
        
        <Card className="mb-6">
          <div className="text-center">
            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Record your thoughts
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Speak freely. Your recordings disappear after 24 hours.
            </p>
            
            <div className="flex flex-col items-center">
              {isRecording ? (
                <>
                  <div className={`text-xl font-mono mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {formatTime(recordingTime)}
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4"
                  >
                    <Mic size={32} color="white" />
                  </motion.div>
                  <Button 
                    onClick={stopRecording}
                    variant="primary"
                    className="flex items-center bg-red-500 hover:bg-red-600"
                  >
                    <Square size={16} className="mr-2" />
                    Stop Recording
                  </Button>
                </>
              ) : (
                <Button
                  onClick={startRecording}
                  className="flex items-center"
                >
                  <Mic size={16} className="mr-2" />
                  Start Recording
                </Button>
              )}
            </div>
          </div>
        </Card>
        
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Recordings
        </h2>
        
        <div className="space-y-4">
          {user.ventBoxRecordings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No recordings yet. Your voice matters - let it out!
            </p>
          ) : (
            user.ventBoxRecordings.map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="transition-all"
              >
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {formatDate(recording.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expires: {formatDate(recording.expiresAt)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded-full ${
                          currentPlayingId === recording.id && isPlaying
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onClick={() => togglePlayPause(recording.id)}
                      >
                        {currentPlayingId === recording.id && isPlaying ? (
                          <Pause size={16} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Play size={16} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                        onClick={() => deleteVentBoxRecording(recording.id)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Duration: {formatTime(recording.duration)}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VentBox;