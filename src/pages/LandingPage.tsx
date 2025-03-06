import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart2, 
  MessageSquare, 
  Music, 
  BookOpen, 
  Award, 
  ChevronDown,
  Users,
  Video,
  Clock,
  Map,
  Mic,
  AlertTriangle,
  Leaf // Add this
} from 'lucide-react';
import Button from '../components/ui/Button';
import MoodSelector from '../components/ui/MoodSelector';
import useStore from '../store/useStore';
import { getMoodTextColor } from '../utils/theme';
import LoadingScreen from '../components/loading/LoadingScreen';
import GlowingLoginSignup from '../components/auth/GlowingLoginSignup';
import TopForumPosts from '../components/forum/TopForumPosts';

// Flashcard data
const flashcardsData = [
  { id: 1, title: "Welcome to Mindful", content: "Your personal mental health companion" },
  { id: 2, title: "Track Your Mood", content: "Log your emotions and see patterns over time" },
  { id: 3, title: "Connect Anonymously", content: "Share experiences and get support from peers" },
  { id: 4, title: "Get Started", content: "Choose how you're feeling today to begin" }
];

// Mood accent colors for animations and icons
const moodColors = {
  happy: ["#4ade80", "#3b82f6"],
  sad: ["#60a5fa", "#3b82f6"],
  angry: ["#f87171", "#ef4444"],
  anxious: ["#fcd34d", "#f59e0b"],
  neutral: ["#a8a29e", "#78716c"],
  default: ["#818cf8", "#6366f1"]
};

const LandingPage: React.FC = () => {
  const { currentMood, darkMode, setShowFlashcards } = useStore();
  const textColorClass = getMoodTextColor(currentMood, darkMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showingFlashcards, setShowingFlashcards] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showLoginSignup, setShowLoginSignup] = useState(false);
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  
  // For parallax scrolling
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"]
  });
  
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const featureY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -50]);
  
  // Animation for sections
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  
  // Get mood-based accent colors for animations and icons
  const getMoodColors = () => {
    if (!currentMood) return moodColors.default;
    return moodColors[currentMood as keyof typeof moodColors] || moodColors.default;
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const flashcardVariants = {
    initial: { rotateY: 180, opacity: 0 },
    animate: { rotateY: 0, opacity: 1, transition: { duration: 0.8 } },
    exit: { rotateY: -180, opacity: 0, transition: { duration: 0.5 } }
  };
  
  const handleGetStarted = () => {
    // Show the login/signup component
    setShowLoginSignup(true);
  };
  
  const handleLoginSignupComplete = () => {
    setShowLoginSignup(false);
    
    // Go directly to loading screen, bypassing flashcards
    setIsLoading(true);
  };
  
  const handleLoadingComplete = () => {
    setIsLoading(false);
    navigate('/dashboard');
  };
  
  // Features array with navigation paths
  const features = [
    {
      title: "Mood Tracker",
      description: "Log and track your emotions over time",
      icon: <BarChart2 size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/mood-tracker"
    },
    {
      title: "Body Map",
      description: "Track where you feel emotions in your body",
      icon: <Map size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/body-map"
    },
    {
      title: "Time Capsule",
      description: "Save thoughts to revisit in the future",
      icon: <Clock size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/time-capsule"
    },
    {
      title: "Vent Box",
      description: "Record your thoughts and let them go",
      icon: <Mic size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/vent-box"
    },
    {
      title: "Community Forum",
      description: "Connect with peers and share experiences",
      icon: <MessageSquare size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/forum"
    },
    {
      title: "Relaxation Music",
      description: "Mood-based playlists to help you relax",
      icon: <Music size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/music"
    },
    {
      title: "Friends Chat",
      description: "Secure, encrypted messaging with trusted friends",
      icon: <Users size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/friends"
    },
    {
      title: "Therapy Garden",
      description: "Grow and nurture your mental wellness garden",
      icon: <Leaf size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/therapy-garden"
    },
    {
      title: "Virtual Doctor",
      description: "Connect with mental health professionals",
      icon: <Video size={32} className={`mb-3 ${textColorClass}`} />,
      path: "/doctor"
    }
  ];

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Get current mood colors
  const colors = getMoodColors();

  return (
    <div 
      ref={mainRef}
      className={`min-h-screen bg-white dark:bg-gray-900 transition-all duration-700 ease-in-out`}
    >
      {/* Emergency Help Button - Fixed Position */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={() => navigate('/emergency')}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg"
          size="md"
        >
          <AlertTriangle size={20} />
          Emergency Help
        </Button>
      </motion.div>
      
      {/* Login/Signup Modal */}
      <AnimatePresence>
        {showLoginSignup && (
          <GlowingLoginSignup
            onClose={() => setShowLoginSignup(false)}
            onComplete={handleLoginSignupComplete}
            accentColors={colors}
          />
        )}
      </AnimatePresence>
      
      {/* Flashcards Modal */}
      <AnimatePresence>
        {showingFlashcards && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFlashcard}
                className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full perspective-1000`}
                variants={flashcardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ 
                  transformStyle: "preserve-3d", 
                  willChange: "transform, opacity",
                  borderTop: `4px solid ${colors[0]}`,
                  borderBottom: `4px solid ${colors[1]}`
                }}
              >
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: colors[0] }}>
                  {flashcardsData[currentFlashcard].title}
                </h3>
                <p className="text-lg text-center">
                  {flashcardsData[currentFlashcard].content}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - with Parallax */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <motion.div 
          style={{ y: headerY }}
          className="absolute w-full h-full top-0 left-0 z-0 opacity: 20 pointer-events-none"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                opacity: Math.random() * 0.3,
                willChange: "transform"
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ 
                duration: 15 + Math.random() * 10, 
                repeat: Infinity,
                ease: "linear" 
              }}
            />
          ))}
        </motion.div>

        {/* Existing hero content with enhanced colors */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6 relative z-10"
        >
          <Brain 
            size={64} 
            className={`filter drop-shadow-lg`} 
            style={{ color: colors[0] }}
          />
        </motion.div>
        
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ 
            color: colors[0]
          }}
        >
          Mindful
        </motion.h1>
        
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`text-xl md:text-2xl max-w-2xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Your personal mental health companion for university life
        </motion.p>
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10"
        >
          <h3 className={`text-lg mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            How are you feeling today?
          </h3>
          <MoodSelector size="lg" />
        </motion.div>
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button 
            onClick={handleGetStarted} 
            size="lg" 
            style={{ 
              background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
              border: 'none'
            }}
          >
            Get Started
          </Button>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown 
              size={32} 
              style={{ color: colors[0], filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} 
            />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section - with Parallax */}
      <section className="py-20 px-4 relative bg-gray-50 dark:bg-gray-800" ref={ref}>
        <motion.div
          style={{ y: featureY }}
          className="absolute inset-0 opacity-30 pointer-events-none"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-xl"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                background: `linear-gradient(135deg, ${colors[0]}22, ${colors[1]}22)`,
                willChange: "transform"
              }}
            />
          ))}
        </motion.div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                color: colors[0]
              }}
            >
              Features Designed for Student Well-being
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Our platform offers a variety of tools to help you monitor and improve your mental health
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg cursor-pointer`}
                whileHover={{ 
                  y: -5, 
                  boxShadow: `0 15px 30px -10px ${colors[0]}33`,
                  transition: { duration: 0.2 } 
                }}
                onClick={() => navigate(feature.path)}
              >
                <div className="text-center">
                  {React.cloneElement(feature.icon, {
                    style: { color: colors[0], margin: '0 auto 0.75rem auto' }
                  })}
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {feature.title}
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Forum Posts Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <TopForumPosts />
        </div>
      </section>

      {/* Friends Chat Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key="friends-chat"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`relative rounded-xl overflow-hidden ${
              darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
            } shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-500`}></div>
            
            <Link to="/friends" className="block p-5">
              <div className="flex items-start">
                <div className={`p-3 rounded-lg mr-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-purple-100'
                }`}>
                  <MessageSquare size={24} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                
                <div>
                  <div className="flex items-center">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Friends Chat
                    </h3>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      E2E Encrypted
                    </span>
                  </div>
                  
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Secure, encrypted messaging with trusted friends
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Other sections remain the same */}
    </div>
  );
};

export default LandingPage;