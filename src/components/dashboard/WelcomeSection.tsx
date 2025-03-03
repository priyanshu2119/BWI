import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Update the props interface to match what's passed from Dashboard.tsx
interface WelcomeSectionProps {
  moodConfig: any;
  darkMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  quoteOfTheDay: string;
  username?: string; // Make this optional since Dashboard may not pass it
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ moodConfig, darkMode, activeTab, setActiveTab, quoteOfTheDay, username }) => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulated API call for quote of the day
    const fetchQuote = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an actual API call
        // For now, let's simulate with a delay and static quote
        await new Promise(resolve => setTimeout(resolve, 1000));
        setQuote({
          text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
          author: "Nelson Mandela"
        });
      } catch (error) {
        console.error("Error fetching quote:", error);
        setQuote({
          text: "Mental health is not a destination, but a journey.",
          author: "Unknown"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuote();
  }, []);
  
  const tabVariants = {
    active: { 
      borderBottom: `2px solid var(--${moodConfig.accentColor.replace('text-', '')})`,
      color: darkMode ? '#fff' : '#000',
      transition: { duration: 0.3 }
    },
    inactive: { 
      borderBottom: '2px solid transparent',
      color: darkMode ? '#94a3b8' : '#64748b',
      transition: { duration: 0.3 }
    }
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className={`text-2xl font-semibold ${moodConfig.accentColor}`}>
        Welcome Back, {username}!
      </h2>
      <p className={`text-sm mt-1 mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Here's your mental wellness summary for {getCurrentDate()}
      </p>
      
      {/* Date Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {['today', 'this week', 'this month'].map(tab => (
          <motion.button
            key={tab}
            className={`pb-2 pt-1 px-1 text-sm font-medium capitalize`}
            variants={tabVariants}
            initial="inactive"
            animate={activeTab === tab ? 'active' : 'inactive'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </motion.button>
        ))}
      </div>
      
      {/* Quote */}
      <div className="mt-4">
        <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Quote of the Day
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse h-16">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className={`text-sm italic ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              "{quote.text}"
            </p>
            <p className={`text-xs mt-1 ${moodConfig.accentColor}`}>
              — {quote.author}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(WelcomeSection);