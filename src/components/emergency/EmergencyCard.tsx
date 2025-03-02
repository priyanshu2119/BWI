import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Clock } from 'lucide-react';
import Card from '../ui/Card';
import { EmergencyContact } from '../../types';
import useStore from '../../store/useStore';

interface EmergencyCardProps {
  contact: EmergencyContact;
}

const EmergencyCard: React.FC<EmergencyCardProps> = ({ contact }) => {
  const { darkMode } = useStore();
  
  return (
    <Card className="border-l-4 border-red-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {contact.name}
          </h3>
          
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {contact.description}
          </p>
          
          <div className="flex items-center mt-2 text-sm">
            <Clock size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Available: {contact.available}
            </span>
          </div>
        </div>
        
        <motion.a
          href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
          className="flex items-center justify-center mt-4 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Phone size={16} className="mr-2" />
          <span>{contact.phone}</span>
        </motion.a>
      </div>
    </Card>
  );
};

export default EmergencyCard;