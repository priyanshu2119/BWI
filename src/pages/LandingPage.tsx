import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
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
  Mic
} from 'lucide-react';
import Button from '../components/ui/Button';
import MoodSelector from '../components/ui/MoodSelector';
import useStore from '../store/useStore';
import { getMoodTextColor } from '../utils/theme';
import LoadingScreen from '../components/loading/LoadingScreen';

const LandingPage: React.FC = () => {
  const { currentMood, darkMode, setShowFlashcards } = useStore();
  const textColorClass = getMoodTextColor(currentMood, darkMode);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
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
  
  const handleGetStarted = () => {
    setIsLoading(true);
    setShowFlashcards(true);
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
    }
  ];

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <Brain size={64} className={textColorClass} />
        </motion.div>
        
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4"
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
          <Button onClick={handleGetStarted} size="lg">
            Get Started
          </Button>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={32} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
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
                className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg cursor-pointer`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => navigate(feature.path)}
              >
                <div className="text-center">
                  {feature.icon}
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
      
      {/* Other sections can remain but without duplicate feature boxes */}
      {/* Remove footer feature boxes and texts */}
    </div>
  );
};

export default LandingPage;