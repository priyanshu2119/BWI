import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';

const NewPostForm: React.FC = () => {
  const { addForumPost, darkMode } = useStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addForumPost(content);
      setContent('');
      setIsSubmitting(false);
    }, 500);
  };
  
  return (
    <Card className="mb-6">
      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Share Anonymously
      </h3>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts, ask for advice, or start a discussion..."
        className={`w-full p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        } border focus:ring-2 focus:ring-purple-500 focus:outline-none`}
        rows={4}
      />
      
      <div className="flex justify-between items-center mt-3">
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          All posts are anonymous. Be kind and respectful.
        </p>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            icon={<Send size={16} />}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};

export default NewPostForm;