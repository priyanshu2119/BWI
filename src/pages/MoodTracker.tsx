import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import MoodTrackerForm from '../components/mood/MoodTrackerForm';
import MoodChart from '../components/dashboard/MoodChart';
import useStore from '../store/useStore';

const MoodTracker: React.FC = () => {
  const { darkMode, user } = useStore();
  
  // Get the last 5 mood entries
  const recentEntries = [...user.moodEntries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'sad': return '😢';
      case 'neutral': return '😐';
      case 'happy': return '😃';
      default: return '😐';
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Mood Tracker
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <MoodTrackerForm />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Mood History
          </h2>
          <MoodChart />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Recent Entries
          </h2>
          
          {recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getMoodEmoji(entry.mood)}</span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                      </div>
                      
                      {entry.note && (
                        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          "{entry.note}"
                        </p>
                      )}
                    </div>
                    
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No mood entries yet. Start tracking your mood above!
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default MoodTracker;