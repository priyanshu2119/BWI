import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';

interface NewPostFormProps {
  onSubmit: (content: string) => boolean;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ onSubmit }) => {
  const { darkMode } = useStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Submit via WebSocket wrapper function
    const success = onSubmit(content);
    
    if (success) {
      setContent('');
      setIsSubmitting(false);
    } else {
      setError("Your post may contain inappropriate content and was flagged for review.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Share Anonymously
      </h3>
      
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Share your thoughts, ask for advice, or start a discussion..."
        className={`w-full p-3 rounded-lg ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        } border focus:ring-2 focus:ring-purple-500 focus:outline-none ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
        rows={4}
      />
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-red-500 flex items-center text-sm"
        >
          <AlertTriangle size={14} className="mr-1" />
          {error}
        </motion.div>
      )}
      
      <div className="flex justify-between items-center mt-3">
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          All posts are anonymous. Be kind and respectful.
        </p>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white"
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