import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';
import { ForumPost as ForumPostType } from '../../types';

interface ForumPostProps {
  post: ForumPostType;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
  const { upvotePost, downvotePost, darkMode } = useStore();
  const [showReplies, setShowReplies] = useState(false);
  
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to minutes, hours, days
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  
  return (
    <Card variant="glass" className="mb-4">
      <div className="mb-3">
        <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
          {post.content}
        </p>
        
        <div className="flex items-center mt-2 text-sm">
          <Clock size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTimestamp(post.timestamp)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <motion.button
            onClick={() => upvotePost(post.id)}
            className={`flex items-center px-2 py-1 rounded ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <ThumbsUp size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {post.upvotes}
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => downvotePost(post.id)}
            className={`flex items-center px-2 py-1 rounded ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <ThumbsDown size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
            <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {post.downvotes}
            </span>
          </motion.button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplies(!showReplies)}
          icon={<MessageSquare size={16} />}
        >
          {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
        </Button>
      </div>
      
      {showReplies && post.replies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pl-4 border-l-2 border-gray-300 dark:border-gray-700"
        >
          {post.replies.map(reply => (
            <div key={reply.id} className="mb-3">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {reply.content}
              </p>
              
              <div className="flex items-center mt-1 text-xs">
                <Clock size={12} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatTimestamp(reply.timestamp)}
                </span>
                
                <div className="flex items-center ml-3">
                  <ThumbsUp size={12} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {reply.upvotes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </Card>
  );
};

export default ForumPost;