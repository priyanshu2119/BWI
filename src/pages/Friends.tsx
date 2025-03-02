import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageSquare, Clock, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const Friends: React.FC = () => {
  const { user, messages, sendMessage, markMessageAsRead, darkMode } = useStore();
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'h:mm a');
  };
  
  const formatDate = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    if (new Date(now.setDate(now.getDate() - 1)).toDateString() === messageDate.toDateString()) {
      return 'Yesterday';
    }
    
    return format(messageDate, 'MMM d, yyyy');
  };
  
  const getLastActive = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };
  
  const handleSendMessage = () => {
    if (!selectedFriend || !messageText.trim()) return;
    
    sendMessage({
      senderId: user.id,
      receiverId: selectedFriend,
      content: messageText
    });
    
    setMessageText('');
  };
  
  const friendMessages = messages.filter(
    message => 
      (message.senderId === user.id && message.receiverId === selectedFriend) ||
      (message.senderId === selectedFriend && message.receiverId === user.id)
  ).sort((a, b) => a.timestamp - b.timestamp);
  
  const selectedFriendData = user.friends.find(friend => friend.id === selectedFriend);
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Friends
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Connect with friends and chat about your day.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Your Friends
                </h2>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<UserPlus size={16} />}
                >
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {user.friends.map(friend => (
                  <motion.div
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend.id)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedFriend === friend.id
                        ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={friend.avatar} 
                          alt={friend.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                          darkMode ? 'border-gray-800' : 'border-white'
                        } ${
                          friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="ml-3">
                        <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {friend.name}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {friend.status === 'online' ? 'Online' : `Last active ${getLastActive(friend.lastActive)}`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {user.friends.length === 0 && (
                  <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Users size={40} className="mx-auto mb-2 opacity-50" />
                    <p>No friends added yet</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <Card className="h-full">
              {selectedFriend ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <img 
                        src={selectedFriendData?.avatar} 
                        alt={selectedFriendData?.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {selectedFriendData?.name}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedFriendData?.status === 'online' ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedFriend(null)}
                      className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {friendMessages.length > 0 ? (
                      friendMessages.map((message, index) => {
                        const isUser = message.senderId === user.id;
                        const showDate = index === 0 || 
                          formatDate(message.timestamp) !== formatDate(friendMessages[index - 1].timestamp);
                        
                        return (
                          <div key={message.id}>
                            {showDate && (
                              <div className="flex justify-center my-2">
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {formatDate(message.timestamp)}
                                </div>
                              </div>
                            )}
                            
                            <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isUser
                                  ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                              }`}>
                                <p>{message.content}</p>
                                <div className={`text-xs mt-1 text-right ${
                                  isUser
                                    ? 'text-purple-200'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <MessageSquare size={40} className={`mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 p-2 rounded-l-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                        } border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="rounded-l-none"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessageSquare size={64} className={`mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select a friend to chat
                  </h3>
                  <p className={`text-center max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Choose a friend from the list to start a conversation
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Friends;