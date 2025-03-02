import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone } from 'lucide-react';
import Layout from '../components/layout/Layout';
import EmergencyCard from '../components/emergency/EmergencyCard';
import Card from '../components/ui/Card';
import useStore from '../store/useStore';

const Emergency: React.FC = () => {
  const { emergencyContacts, darkMode } = useStore();
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-xl bg-red-600 text-white mb-8 flex items-start`}
        >
          <AlertTriangle size={24} className="mr-4 flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Emergency Help
            </h1>
            <p>
              If you're experiencing a mental health emergency or crisis, please reach out to one of these resources immediately. Help is available 24/7.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          {emergencyContacts.map(contact => (
            <EmergencyCard key={contact.id} contact={contact} />
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              When to Seek Help
            </h2>
            
            <ul className={`list-disc pl-5 space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>You're thinking about harming yourself or others</li>
              <li>You're experiencing severe emotional distress</li>
              <li>You're having thoughts of suicide</li>
              <li>You're unable to care for yourself (not eating, sleeping, etc.)</li>
              <li>You're experiencing hallucinations or delusions</li>
              <li>You feel out of control or disconnected from reality</li>
            </ul>
            
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <Phone size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                <p className={`ml-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Remember: It's okay to ask for help. You're not alone.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Emergency;