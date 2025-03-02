import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import NewPostForm from '../components/forum/NewPostForm';
import ForumPost from '../components/forum/ForumPost';
import useStore from '../store/useStore';

const Forum: React.FC = () => {
  const { forumPosts, darkMode } = useStore();
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Anonymous Forum
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Share your thoughts, ask questions, and connect with others in a safe space.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NewPostForm />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Recent Discussions
          </h2>
          
          {forumPosts.length > 0 ? (
            <div>
              {forumPosts.map((post) => (
                <ForumPost key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No discussions yet. Be the first to start a conversation!
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Forum;