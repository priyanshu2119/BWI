import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import useStore from '../../store/useStore';
import { Link } from 'react-router-dom';

const EmergencyHelpButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { emergencyContacts } = useStore();
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mb-4 w-72"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Emergency Help
              </h3>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {emergencyContacts.slice(0, 2).map(contact => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center p-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <Phone size={16} className="mr-2 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm">{contact.phone}</div>
                  </div>
                </a>
              ))}
              
              <Link
                to="/emergency"
                className="block text-center text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                onClick={() => setIsExpanded(false)}
              >
                View all emergency resources
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 4px 6px rgba(220, 38, 38, 0.3)',
            '0 8px 12px rgba(220, 38, 38, 0.5)',
            '0 4px 6px rgba(220, 38, 38, 0.3)'
          ]
        }}
        transition={{ 
          repeat: Infinity, 
          repeatType: 'reverse', 
          duration: 2
        }}
      >
        <Phone size={24} />
      </motion.button>
    </div>
  );
};

export default EmergencyHelpButton;