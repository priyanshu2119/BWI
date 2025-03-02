import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import useStore from '../../store/useStore';
import { Resource } from '../../types';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { user, saveResource, unsaveResource, darkMode } = useStore();
  
  const isSaved = user.savedResources.includes(resource.id);
  
  const getCategoryBadgeColor = () => {
    switch (resource.category) {
      case 'article':
        return darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'video':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'tip':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'exercise':
        return darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800';
      default:
        return darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveResource(resource.id);
    } else {
      saveResource(resource.id);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <div 
        className="h-40 bg-cover bg-center rounded-t-lg mb-3"
        style={{ backgroundImage: `url(${resource.imageUrl})` }}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor()}`}>
            {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
          </span>
          
          <motion.button
            onClick={handleSaveToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {isSaved ? (
              <BookmarkCheck size={20} className="text-purple-500" />
            ) : (
              <Bookmark size={20} />
            )}
          </motion.button>
        </div>
        
        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {resource.title}
        </h3>
        
        <p className={`text-sm mb-4 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {resource.description}
        </p>
        
        <a
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center text-sm font-medium ${
            darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
          }`}
        >
          <span>Read More</span>
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
    </Card>
  );
};

export default ResourceCard;