import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ResourceCard from '../components/resources/ResourceCard';
import useStore from '../store/useStore';
import Button from '../components/ui/Button';

const Resources: React.FC = () => {
  const { resources, darkMode } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = [
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'tip', label: 'Tips' },
    { value: 'exercise', label: 'Exercises' }
  ];
  
  const filteredResources = activeCategory
    ? resources.filter(resource => resource.category === activeCategory)
    : resources;
  
  return (
    <Layout>
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Resource Library
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Explore articles, videos, and self-care tips to support your mental well-being.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <Button
            variant={activeCategory === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          
          {categories.map(category => (
            <Button
              key={category.value}
              variant={activeCategory === category.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory || 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResources.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Resources;