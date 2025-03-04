import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MoodSelector from '../components/ui/MoodSelector';
import { Progress } from '../components/ui/progress';
import { 
  Award, 
  BookOpen, 
  MessageSquare, 
  Phone, 
  Info, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  CheckCircle,
  Music,
  HeartPulse,
  Map,
  Clock,
  Mic,
  Video,
  Calendar as CalendarIcon,
  BookOpen as BookOpenIcon,
  BadgeCheck,
  Star
} from 'lucide-react';

// Import new components
import MoodTrackerPanel from '../components/dashboard/MoodTrackerPanel';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import DailyChallengeCard from '../components/dashboard/DailyChallengeCard';
import ProgressPanel from '../components/dashboard/ProgressPanel';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import RecommendedResources from '../components/dashboard/RecommendedResources';

// Mood-specific theme configurations
const moodConfigs = {
  happy: {
    bgGradient: 'from-yellow-50 to-amber-100 dark:from-amber-900/30 dark:to-yellow-800/20',
    cardBg: 'bg-amber-50 dark:bg-amber-900/40',
    accentColor: 'text-amber-500 dark:text-amber-400',
    accentBorder: 'border-amber-300 dark:border-amber-700',
    buttonGradient: 'from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500',
    animation: {
      transition: { type: 'spring', stiffness: 400, damping: 17 },
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      hover: { scale: 1.05, transition: { duration: 0.2 } }
    },
    affirmation: "You're radiating positivity today! Keep that energy going!",
    challenges: [
      "Share your happiness with someone today",
      "Try a new activity that brings you joy",
      "Write down three things you're grateful for"
    ]
  },
  neutral: {
    bgGradient: 'from-blue-50 to-teal-100 dark:from-blue-900/30 dark:to-teal-800/20',
    cardBg: 'bg-teal-50 dark:bg-teal-900/40',
    accentColor: 'text-teal-500 dark:text-teal-400',
    accentBorder: 'border-teal-300 dark:border-teal-700',
    buttonGradient: 'from-teal-400 to-blue-400 hover:from-teal-500 hover:to-blue-500',
    animation: {
      transition: { duration: 0.5 },
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      hover: { y: -5, transition: { duration: 0.2 } }
    },
    affirmation: "Balance is key. Your calm mindset helps you stay focused.",
    challenges: [
      "Practice mindfulness for 5 minutes",
      "Set one achievable goal for today",
      "Take a short walk to clear your mind"
    ]
  },
  sad: {
    bgGradient: 'from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/20',
    cardBg: 'bg-purple-50 dark:bg-purple-900/40',
    accentColor: 'text-purple-500 dark:text-purple-400',
    accentBorder: 'border-purple-300 dark:border-purple-700',
    buttonGradient: 'from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500',
    animation: {
      transition: { duration: 0.7 },
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)', transition: { duration: 0.3 } }
    },
    affirmation: "It's okay to feel down. Be gentle with yourself today.",
    challenges: [
      "Practice self-compassion for 5 minutes",
      "Reach out to a supportive friend",
      "Try a comfort activity that soothes you"
    ]
  },
  stressed: {
    bgGradient: 'from-rose-50 to-red-100 dark:from-rose-900/30 dark:to-red-900/20',
    cardBg: 'bg-rose-50 dark:bg-rose-900/40',
    accentColor: 'text-rose-500 dark:text-rose-400',
    accentBorder: 'border-rose-300 dark:border-rose-700',
    buttonGradient: 'from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500',
    animation: {
      transition: { type: 'tween', ease: 'easeOut', duration: 0.5 },
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      hover: { scale: 1.02, transition: { duration: 0.2 } }
    },
    affirmation: "Take a deep breath. You have the strength to handle this.",
    challenges: [
      "Practice deep breathing for 2 minutes",
      "Break down one overwhelming task into smaller steps",
      "Schedule a short break just for yourself"
    ]
  },
  anxious: {
    bgGradient: 'from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/20',
    cardBg: 'bg-orange-50 dark:bg-orange-900/40',
    accentColor: 'text-orange-500 dark:text-orange-400',
    accentBorder: 'border-orange-300 dark:border-orange-700',
    buttonGradient: 'from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500',
    animation: {
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      hover: { y: -3, scale: 1.03, transition: { duration: 0.2 } }
    },
    affirmation: "Anxiety is temporary. Focus on what you can control right now.",
    challenges: [
      "Practice grounding: name 5 things you can see, 4 you can touch",
      "Write down your worries, then challenge one negative thought",
      "Listen to calming music for 10 minutes"
    ]
  }
};

// Sample data for new components
const mockData = {
  // For MoodTrackerPanel
  moodData: {
    dailyMoodPercentage: 65,
    dominantMood: "neutral",
    moodInsight: "You're maintaining a steady emotional balance today."
  },
  // For WelcomeSection
  welcomeData: {
    quoteOfTheDay: "The greatest glory in living lies not in never falling, but in rising every time we fall."
  },
  // For ProgressPanel
  progressData: {
    completedTasks: 3,
    totalTasks: 5,
    achievements: [
      { id: 1, name: "7-Day Streak", icon: <BadgeCheck size={16} /> },
      { id: 2, name: "Mood Master", icon: <Star size={16} /> }
    ]
  },
  // For UpcomingSessions
  upcomingSessions: [
    {
      id: 1,
      title: "Mindfulness Workshop",
      date: "Today, 3:00 PM",
      host: "Dr. Sarah Johnson",
      type: "workshop"
    },
    {
      id: 2,
      title: "Therapy Session",
      date: "Tomorrow, 11:00 AM",
      host: "Dr. Michael Chen",
      type: "therapy"
    }
  ],
  // For RecommendedResources
  recommendedResources: [
    {
      id: 1,
      title: "Managing Exam Anxiety",
      category: "Article",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Deep Sleep Meditation",
      category: "Audio",
      readTime: "20 min"
    }
  ]
};

const Dashboard: React.FC = () => {
  const { 
    user, 
    currentMood, 
    darkMode,
    incrementStreak,
    completeChallenge,
    dailyChallenge
  } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('today');

  // Get current mood config (default to neutral if mood not set)
  const moodConfig = moodConfigs[currentMood || 'neutral'];
  
  // Check if it's a new day to increment streak
  useEffect(() => {
    const lastLogin = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      incrementStreak();
      localStorage.setItem('lastLoginDate', today);
    }
  }, [incrementStreak]);

  // Pick a random challenge based on mood
  const getRandomChallenge = () => {
    const challenges = moodConfig.challenges;
    return challenges[Math.floor(Math.random() * challenges.length)];
  };
  
  const dailyChallengeText = dailyChallenge?.title || getRandomChallenge();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMood} // This forces re-render when mood changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`container mx-auto px-4 py-6 bg-gradient-to-b ${moodConfig.bgGradient} rounded-lg min-h-[calc(100vh-8rem)]`}
        >
          {/* Header with Mood Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {user?.name || 'Student'}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                How are you feeling today?
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <MoodSelector size="md" />
            </div>
          </div>
          
          {/* Top Row Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Mood Tracker Panel - Top Left */}
            <MoodTrackerPanel 
              moodConfig={moodConfig} 
              darkMode={darkMode} 
              moodData={mockData.moodData} 
            />
            
            {/* Welcome Section - Top Center */}
            <WelcomeSection 
              moodConfig={moodConfig} 
              darkMode={darkMode} 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              quoteOfTheDay={mockData.welcomeData.quoteOfTheDay}
            />
            
            {/* Daily Challenge Card - Top Right */}
            <DailyChallengeCard
              moodConfig={moodConfig}
              darkMode={darkMode}
              challengeText={dailyChallengeText}
              onComplete={completeChallenge}
              isCompleted={dailyChallenge?.completed || false}
            />
          </div>

          {/* Middle Row - Progress & Quick Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            {/* Your Progress - Bottom Left */}
            <ProgressPanel 
              moodConfig={moodConfig} 
              darkMode={darkMode} 
              user={user}
              completedTasks={mockData.progressData.completedTasks}
              totalTasks={mockData.progressData.totalTasks}
              achievements={mockData.progressData.achievements}
            />

            {/* Quick Access Tools */}
            <div className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}>
              <h2 className={`text-xl font-semibold mb-4 ${moodConfig.accentColor}`}>
                Quick Access
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: "Forum", icon: <MessageSquare size={24} />, path: "/forum" },
                  { name: "Resources", icon: <BookOpen size={24} />, path: "/resources" },
                  { name: "Emergency", icon: <AlertCircle size={24} />, path: "/emergency" },
                  { name: "Doctor", icon: <Phone size={24} />, path: "/doctor" },
                  { name: "Music", icon: <Music size={24} />, path: "/music" },
                  { name: "Support", icon: <Info size={24} />, path: "/support" },
                  { 
                    name: "Friends Chat", 
                    icon: <MessageSquare size={24} />, 
                    path: "/friends",
                    description: "Secure, encrypted messaging with trusted friends",
                    badge: "E2E Encrypted",
                    gradient: "from-purple-400 to-indigo-500"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ 
                      y: -5, 
                      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)` 
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.1 + index * 0.05 
                    }}
                    onClick={() => navigate(item.path)}
                    className={`bg-${moodConfig.accentColor.split('-')[1]}-50 dark:bg-${moodConfig.accentColor.split('-')[1]}-900/20 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer border border-transparent hover:border-${moodConfig.accentColor.split('-')[1]}-300`}
                  >
                    <div className={`mb-2 ${moodConfig.accentColor}`}>{item.icon}</div>
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* Upcoming Sessions - Bottom Center */}
            <UpcomingSessions
              moodConfig={moodConfig}
              darkMode={darkMode}
              sessions={mockData.upcomingSessions}
            />
            
            {/* Recommended Resources - Bottom Right */}
            <RecommendedResources
              moodConfig={moodConfig}
              darkMode={darkMode}
              resources={mockData.recommendedResources}
            />
            
            {/* Wellbeing Activities */}
            <div>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Wellbeing Activities
              </h2>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { 
                    name: "Time Capsule", 
                    icon: <Clock size={24} />, 
                    path: "/time-capsule",
                    description: "Save thoughts to revisit in the future" 
                  },
                  { 
                    name: "Vent Box", 
                    icon: <Mic size={24} />, 
                    path: "/vent-box",
                    description: "Record your thoughts and let them go" 
                  },
                  { 
                    name: "Mood Journal", 
                    icon: <HeartPulse size={24} />, 
                    path: "/mood-tracker",
                    description: "Track your emotional journey" 
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    whileHover={moodConfig.animation.hover}
                    initial={moodConfig.animation.initial}
                    animate={moodConfig.animation.animate}
                    transition={{ ...moodConfig.animation.transition, delay: 0.3 + index * 0.1 }}
                    onClick={() => navigate(item.path)}
                    className={`${moodConfig.cardBg} rounded-xl shadow p-4 cursor-pointer border ${moodConfig.accentBorder} flex items-center`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${moodConfig.accentColor} bg-opacity-20`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight size={16} className={`${moodConfig.accentColor} ml-auto`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default Dashboard;