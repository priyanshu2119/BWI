import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, File, Headphones } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  category: string;
  readTime: string;
}

interface RecommendedResourcesProps {
  moodConfig: any;
  darkMode: boolean;
  resources: Resource[];
}

const RecommendedResources: React.FC<RecommendedResourcesProps> = ({
  moodConfig,
  darkMode,
  resources
}) => {
  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <BookOpen className={`mr-2 ${moodConfig.accentColor}`} size={22} />
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recommended For You
        </h2>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-sm flex items-center`}
            whileHover={{ 
              y: -2,
              transition: { duration: 0.2 }
            }}
          >
            <div className={`p-2 rounded-lg mr-3 bg-${moodConfig.accentColor.split('-')[1]}-500/20`}>
              {resource.category === 'Article' ? (
                <File size={20} className={moodConfig.accentColor} />
              ) : (
                <Headphones size={20} className={moodConfig.accentColor} />
              )}
            </div>

            <div className="flex-1">
              <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {resource.title}
              </h3>
              <div className="flex items-center">
                <span className={`text-xs ${moodConfig.accentColor}`}>
                  {resource.category}
                </span>
                <span className={`text-xs mx-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  •
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {resource.readTime}
                </span>
              </div>
            </div>

            <ArrowRight size={16} className={`${moodConfig.accentColor} ml-2`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(RecommendedResources);