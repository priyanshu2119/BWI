import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Send, Lock, Unlock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { format, addDays, isAfter } from 'date-fns';

const TimeCapsule: React.FC = () => {
  const { user, createTimeCapsule, darkMode } = useStore();
  const [message, setMessage] = useState('');
  const [unlockInDays, setUnlockInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      createTimeCapsule(message, unlockInDays);
      setMessage('');
      setIsSubmitting(false);
    }, 500);
  };
  
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMMM d, yyyy');
  };
  
  const isUnlockable = (unlockAt: number) => {
    return isAfter(new Date(), new Date(unlockAt));
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Time Capsule
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Send messages to your future self. Reflect on your growth and journey.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <Card>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Create a New Time Capsule
            </h2>
            
            <div className="mb-4">
              <label 
                htmlFor="message" 
                className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Your Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message to your future self..."
                className={`w-full p-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } border focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                rows={4}
              />
            </div>
            
            <div className="mb-6">
              <label 
                htmlFor="unlockInDays" 
                className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Unlock After
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="unlockInDays"
                  min="1"
                  max="365"
                  value={unlockInDays}
                  onChange={(e) => setUnlockInDays(parseInt(e.target.value))}
                  className={`w-full mr-4 h-2 rounded-full appearance-none cursor-pointer ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${
                      darkMode ? '#8B5CF6' : '#6D28D9'
                    } ${(unlockInDays / 365) * 100}%, ${
                      darkMode ? '#374151' : '#e5e7eb'
                    } 0)`,
                  }}
                />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {unlockInDays} {unlockInDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Will be unlocked on: {formatDate(Date.now() + unlockInDays * 86400000)}
              </p>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              icon={<Send size={16} />}
              fullWidth
            >
              {isSubmitting ? 'Creating...' : 'Create Time Capsule'}
            </Button>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Your Time Capsules
          </h2>
          
          {user.timeCapsules.length > 0 ? (
            <div className="space-y-4">
              {user.timeCapsules.map((capsule) => (
                <motion.div
                  key={capsule.id}
                  className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        {capsule.unlocked || isUnlockable(capsule.unlockAt) ? (
                          <Unlock size={18} className={`mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        ) : (
                          <Lock size={18} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        )}
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {capsule.unlocked || isUnlockable(capsule.unlockAt) ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                      
                      {capsule.unlocked || isUnlockable(capsule.unlockAt) ? (
                        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          "{capsule.message}"
                        </p>
                      ) : (
                        <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          This message is locked until {formatDate(capsule.unlockAt)}
                        </p>
                      )}
                      
                      <div className="flex items-center mt-2 text-xs">
                        <Calendar size={12} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Created: {formatDate(capsule.createdAt)}
                        </span>
                        
                        <Clock size={12} className={`ml-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Unlocks: {formatDate(capsule.unlockAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              You haven't created any time capsules yet. Write a message to your future self above!
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default TimeCapsule;