import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

interface Session {
  id: number;
  title: string;
  date: string;
  host: string;
  type: string;
}

interface UpcomingSessionsProps {
  moodConfig: any;
  darkMode: boolean;
  sessions: Session[];
}

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  moodConfig,
  darkMode,
  sessions
}) => {
  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center mb-4">
        <Calendar className={`mr-2 ${moodConfig.accentColor}`} size={22} />
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Upcoming Sessions
        </h2>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {session.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full bg-${moodConfig.accentColor.split('-')[1]}-100 ${moodConfig.accentColor}`}>
                {session.type}
              </span>
            </div>

            <div className="flex items-center mb-3">
              <Clock className={`mr-1 ${moodConfig.accentColor}`} size={14} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {session.date}
              </span>
            </div>

            <div className="flex items-center mb-3">
              <Video className={`mr-1 ${moodConfig.accentColor}`} size={14} />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {session.host}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                className={`text-white text-xs px-3 py-2 bg-gradient-to-r ${moodConfig.buttonGradient} flex-1`}
              >
                Join Session
              </Button>
              
              <Button
                className={`text-xs px-3 py-2 border ${moodConfig.accentBorder} ${darkMode ? 'text-white' : 'text-gray-700'} bg-transparent flex-1`}
              >
                Reschedule
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(UpcomingSessions);