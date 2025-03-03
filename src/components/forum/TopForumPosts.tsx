import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const TopForumPosts: React.FC = () => {
  const { forumPosts, darkMode } = useStore();
  const navigate = useNavigate();

  // Get top 3 posts by upvotes
  const topPosts = [...forumPosts]
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 3);

  if (topPosts.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="my-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2 
          variants={itemVariants}
          className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
        >
          Community Highlights
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800 bg-opacity-60' : 'bg-white'
              } shadow-lg backdrop-blur-sm cursor-pointer`}
              onClick={() => navigate('/forum')}
            >
              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-3 mb-3 text-sm`}>
                "{post.content}"
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <ThumbsUp size={14} className={`mr-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className="text-xs text-gray-500">{post.upvotes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle size={14} className={`mr-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className="text-xs text-gray-500">{post.replies.length}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(post.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={itemVariants} 
          className="flex justify-center mt-6"
        >
          <motion.button
            onClick={() => navigate('/forum')}
            className={`flex items-center ${
              darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
            }`}
            whileHover={{ x: 5 }}
          >
            View all discussions 
            <ArrowRight size={16} className="ml-1" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Helper function to format timestamp
const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export default TopForumPosts;