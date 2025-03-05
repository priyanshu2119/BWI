import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import NewPostForm from '../components/forum/NewPostForm';
import ForumPost from '../components/forum/ForumPost';
import useStore from '../store/useStore';
import { Badge, AlertTriangle } from 'lucide-react';
import { ForumPost as ForumPostType } from '../types';

// Simple text-based moderation function
const hasProfanity = (text: string): boolean => {
  const profanityList = ['badword1', 'badword2', 'inappropriate']; // Expand this list
  return profanityList.some(word => text.toLowerCase().includes(word));
};

const Forum: React.FC = () => {
  const { forumPosts, addForumPost, upvotePost, downvotePost, darkMode } = useStore();
  const [filteredPosts, setFilteredPosts] = useState<ForumPostType[]>([]);
  const [filter, setFilter] = useState<'all' | 'popular' | 'recent'>('all');
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [flaggedPosts, setFlaggedPosts] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection setup
  useEffect(() => {
    // In a real app, this would be your actual WebSocket server URL
    const socketUrl = 'wss://your-websocket-server.com/forum'; 
    
    // For demo purposes, we'll create a mock WebSocket implementation
    class MockWebSocket {
      onopen: ((this: WebSocket, ev: Event) => any) | null = null;
      onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
      onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
      onerror: ((this: WebSocket, ev: Event) => any) | null = null;
      readyState: number = 1;

      constructor() {
        setTimeout(() => {
          this.onopen && this.onopen();
        }, 500);
      }

      send(data: string): void {
        // Mock receiving your own message back with server-generated ID
        setTimeout(() => {
          if (this.onmessage) {
            const parsedData = JSON.parse(data);
            if (parsedData.type === 'new_post') {
              const serverData = {
                type: 'new_post',
                post: {
                  ...parsedData.post,
                  id: `server-${Date.now()}`,
                  timestamp: Date.now()
                }
              };
              this.onmessage({ data: JSON.stringify(serverData) });
            } else if (parsedData.type === 'vote') {
              this.onmessage({ data: JSON.stringify(parsedData) });
            }
          }
        }, 300);
      }

      close(): void {
        this.onclose && this.onclose();
      }
    }

    // Use MockWebSocket for demo, would be real WebSocket in production
    wsRef.current = new MockWebSocket() as unknown as WebSocket;

    wsRef.current.onopen = () => {
      console.log('Forum WebSocket connection established');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_post') {
          // Auto-moderation for incoming posts
          const post = data.post;
          
          if (moderationEnabled && hasProfanity(post.content)) {
            setFlaggedPosts(prev => [...prev, post.id]);
          } else {
            addForumPost(post.content, post.id);
          }
        }
        else if (data.type === 'vote') {
          if (data.voteType === 'up') {
            upvotePost(data.postId);
          } else {
            downvotePost(data.postId);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Forum WebSocket connection closed');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.close();
      }
    };
  }, [addForumPost, upvotePost, downvotePost, moderationEnabled]);

  useEffect(() => {
    // Apply filters to posts
    let sorted = [...forumPosts];
    
    switch (filter) {
      case 'popular':
        sorted = sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'recent':
        sorted = sorted.sort((a, b) => b.timestamp - a.timestamp);
        break;
      default:
        // 'all' - sort by a combination of recency and popularity
        sorted = sorted.sort((a, b) => {
          const scoreA = (b.upvotes - b.downvotes) + (b.timestamp > Date.now() - 86400000 ? 5 : 0);
          const scoreB = (a.upvotes - a.downvotes) + (a.timestamp > Date.now() - 86400000 ? 5 : 0);
          return scoreA - scoreB;
        });
    }
    
    // Filter out flagged posts
    setFilteredPosts(sorted.filter(post => !flaggedPosts.includes(post.id)));
  }, [forumPosts, filter, flaggedPosts]);

  // Broadcast new post via WebSocket
  const handleNewPost = (content: string) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      const newPost = {
        id: `local-${Date.now()}`,
        content,
        timestamp: Date.now()
      };

      // Auto-moderation before sending
      if (moderationEnabled && hasProfanity(content)) {
        setFlaggedPosts(prev => [...prev, newPost.id]);
        return false; // Indicate post was rejected
      }

      wsRef.current.send(JSON.stringify({
        type: 'new_post',
        post: newPost
      }));
      return true; // Post accepted
    }
    return false;
  };

  // Handle votes via WebSocket
  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'vote',
        postId,
        voteType
      }));
    }
  };

  // Animation variants
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    exit: { 
      x: -20, 
      opacity: 0,
      transition: { ease: "easeInOut" }
    }
  };

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
        
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6"
        >
          {(['all', 'popular', 'recent'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === filterType 
                  ? 'bg-purple-600 text-white' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <NewPostForm onSubmit={handleNewPost} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Recent Discussions
          </h2>
          
          <AnimatePresence mode="popLayout">
            {filteredPosts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPosts.map((post) => (
                  <motion.div 
                    key={post.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                  >
                    <ForumPost 
                      post={post} 
                      onUpvote={(id) => handleVote(id, 'up')} 
                      onDownvote={(id) => handleVote(id, 'down')}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={darkMode ? 'text-gray-400' : 'text-gray-600'}
              >
                No discussions yet. Be the first to start a conversation!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Forum;