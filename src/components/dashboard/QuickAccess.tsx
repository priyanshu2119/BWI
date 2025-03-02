import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  AlertTriangle, 
  Music, 
  Video, 
  Users, 
  Clock, 
  Mic, 
  Map 
} from 'lucide-react';
import useStore from '../../store/useStore';

const QuickAccess: React.FC = () => {
  const { darkMode } = useStore();
  
  const quickLinks = [
    {
      title: 'Resources',
      description: 'Articles, videos & tips',
      icon: <BookOpen size={24} />,
      path: '/resources',
      color: darkMode ? 'from-blue-800 to-indigo-900' : 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Forum',
      description: 'Anonymous discussions',
      icon: <MessageSquare size={24} />,
      path: '/forum',
      color: darkMode ? 'from-purple-800 to-pink-900' : 'from-purple-400 to-pink-500'
    },
    {
      title: 'Music',
      description: 'Mood-based playlists',
      icon: <Music size={24} />,
      path: '/music',
      color: darkMode ? 'from-green-800 to-teal-900' : 'from-green-400 to-teal-500'
    },
    {
      title: 'Emergency',
      description: 'Immediate help',
      icon: <AlertTriangle size={24} />,
      path: '/emergency',
      color: darkMode ? 'from-red-800 to-orange-900' : 'from-red-400 to-orange-500'
    },
    {
      title: 'Consult Doctor',
      description: 'Professional help',
      icon: <Video size={24} />,
      path: '/doctor',
      color: darkMode ? 'from-cyan-800 to-blue-900' : 'from-cyan-400 to-blue-500'
    },
    {
      title: 'Friends',
      description: 'Connect & chat',
      icon: <Users size={24} />,
      path: '/friends',
      color: darkMode ? 'from-amber-800 to-yellow-900' : 'from-amber-400 to-yellow-500'
    },
    {
      title: 'Time Capsule',
      description: 'Messages to future you',
      icon: <Clock size={24} />,
      path: '/time-capsule',
      color: darkMode ? 'from-violet-800 to-purple-900' : 'from-violet-400 to-purple-500'
    },
    {
      title: 'Vent Box',
      description: 'Talk it out',
      icon: <Mic size={24} />,
      path: '/vent-box',
      color: darkMode ? 'from-rose-800 to-pink-900' : 'from-rose-400 to-pink-500'
    },
    {
      title: 'Body Map',
      description: 'Track physical stress',
      icon: <Map size={24} />,
      path: '/body-map',
      color: darkMode ? 'from-emerald-800 to-green-900' : 'from-emerald-400 to-green-500'
    }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {quickLinks.map((link) => (
        <motion.div key={link.path} variants={item}>
          <Link to={link.path}>
            <motion.div 
              className={`bg-gradient-to-br ${link.color} text-white rounded-xl p-4 h-full
                shadow-lg hover:shadow-xl transition-shadow duration-300`}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col h-full">
                <div className="bg-white bg-opacity-20 rounded-full p-2 w-fit mb-3">
                  {link.icon}
                </div>
                <h3 className="font-semibold">{link.title}</h3>
                <p className="text-xs mt-1 text-white text-opacity-80">{link.description}</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickAccess;