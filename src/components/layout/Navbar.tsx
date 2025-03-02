import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  BarChart2, 
  MessageSquare, 
  BookOpen, 
  Music, 
  Award, 
  Moon, 
  Sun, 
  AlertTriangle 
} from 'lucide-react';
import useStore from '../../store/useStore';
import { getMoodTextColor } from '../../utils/theme';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode, toggleDarkMode, currentMood } = useStore();
  const location = useLocation();
  
  const textColorClass = getMoodTextColor(currentMood, darkMode);
  
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart2 size={20} /> },
    { path: '/mood-tracker', label: 'Mood Tracker', icon: <BarChart2 size={20} /> },
    { path: '/forum', label: 'Forum', icon: <MessageSquare size={20} /> },
    { path: '/resources', label: 'Resources', icon: <BookOpen size={20} /> },
    { path: '/music', label: 'Music', icon: <Music size={20} /> },
    { path: '/achievements', label: 'Achievements', icon: <Award size={20} /> },
    { path: '/emergency', label: 'Emergency Help', icon: <AlertTriangle size={20} /> }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className={`text-xl font-bold ${textColorClass}`}>MindfulHub</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? `${textColorClass} ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'} transition-colors duration-200`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleDarkMode}
              className={`p-2 mr-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'} transition-colors duration-200`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? `${textColorClass} ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;