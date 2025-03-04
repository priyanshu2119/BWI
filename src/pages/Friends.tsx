import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, MessageSquare, Clock, X, Shield, Send, Smile, Lock, Activity } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { format } from 'date-fns';
import CryptoJS from 'crypto-js'; // You'll need to install this package

const Friends: React.FC = () => {
  const { user, messages, sendMessage, markMessageAsRead, darkMode } = useStore();
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState<Record<string, boolean>>({});
  const [encryptionKeys, setEncryptionKeys] = useState<Record<string, string>>({});
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [mood, setMood] = useState<'happy' | 'sad' | 'neutral' | 'excited'>('neutral');
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Connect to WebSocket
  useEffect(() => {
    // In a real app, this would be your actual WebSocket server URL
    const socketUrl = 'wss://your-websocket-server.com/chat'; 
    
    // Mock WebSocket implementation (similar to Forum.tsx)
    class MockWebSocket {
      onopen: (() => void) | null = null;
      onmessage: ((event: any) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: ((error: any) => void) | null = null;
      readyState = 1;

      constructor() {
        setTimeout(() => {
          this.onopen && this.onopen();
        }, 500);
      }

      send(data: string) {
        // Mock receiving your own message or typing indicator back
        setTimeout(() => {
          if (this.onmessage) {
            const parsedData = JSON.parse(data);
            
            if (parsedData.type === 'message') {
              // For real messages, we'll just pass them through
              this.onmessage({ data });
            } 
            else if (parsedData.type === 'typing') {
              // For typing indicators, we'll simulate friend responses
              this.onmessage({ data });
              
              if (parsedData.isTyping) {
                // Simulate friend responding after a few seconds
                setTimeout(() => {
                  if (this.onmessage) {
                    const friendResponse = {
                      type: 'message',
                      senderId: parsedData.receiverId,
                      receiverId: parsedData.senderId,
                      content: generateResponse(parsedData.receiverId),
                      timestamp: Date.now(),
                      encrypted: true
                    };
                    this.onmessage({ data: JSON.stringify(friendResponse) });
                    
                    // Send typing stopped
                    setTimeout(() => {
                      if (this.onmessage) {
                        const typingStop = {
                          type: 'typing',
                          senderId: parsedData.receiverId,
                          receiverId: parsedData.senderId,
                          isTyping: false
                        };
                        this.onmessage({ data: JSON.stringify(typingStop) });
                      }
                    }, 500);
                  }
                }, Math.random() * 5000 + 2000);
              }
            }
          }
        }, 300);
      }

      close() {
        this.onclose && this.onclose();
      }
    }
    
    // Generate a mock response based on friend ID
    const generateResponse = (friendId: string) => {
      const friend = user.friends.find(f => f.id === friendId);
      const responses = [
        `Hey there! How's your day going?`,
        `I've been thinking about the project we discussed.`,
        `Did you see that new movie everyone's talking about?`,
        `I'm feeling ${mood === 'happy' ? 'great' : mood === 'sad' ? 'a bit down' : 'alright'} today.`,
        `We should meet up sometime this week!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    };
    
    // Use our mock WebSocket for demonstration
    wsRef.current = new MockWebSocket() as unknown as WebSocket;
    
    wsRef.current.onopen = () => {
      console.log('Chat WebSocket connection established');
      
      // Generate encryption keys for each friend
      const keys: Record<string, string> = {};
      user.friends.forEach(friend => {
        // In a real app, you would use proper key exchange
        keys[friend.id] = CryptoJS.lib.WordArray.random(16).toString();
      });
      
      setEncryptionKeys(keys);
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Handle received messages
          const decryptedContent = data.encrypted 
            ? decrypt(data.content, encryptionKeys[data.senderId] || 'fallback-key')
            : data.content;
            
          const newMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: decryptedContent,
            timestamp: data.timestamp || Date.now(),
            read: data.senderId === user.id
          };
          
          // Add message to store
          sendMessage(newMessage);
          
          // Mark as read if the chat is currently open
          if (selectedFriend === data.senderId) {
            markMessageAsRead(newMessage.id);
          }
          
          // Generate mood-based suggested responses
          if (data.senderId === selectedFriend) {
            generateSuggestedResponses(decryptedContent);
          }
        } 
        else if (data.type === 'typing') {
          // Handle typing indicators
          setFriendTyping(prev => ({
            ...prev,
            [data.senderId]: data.isTyping
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('Chat WebSocket connection closed');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      
      // Close WebSocket on unmount
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.close();
      }
    };
  }, [user.friends, user.id, sendMessage, markMessageAsRead, selectedFriend, mood]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [friendMessages]);
  
  // E2E Encryption functions (simplified for demo)
  const encrypt = (text: string, key: string): string => {
    try {
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch (e) {
      console.error('Encryption error:', e);
      return text;
    }
  };
  
  const decrypt = (ciphertext: string, key: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Decryption error:', e);
      return ciphertext;
    }
  };
  
  // Generate mood-based suggested responses
  const generateSuggestedResponses = (messageContent: string) => {
    const lowercaseContent = messageContent.toLowerCase();
    
    // Detect mood from message content
    if (/happy|great|excellent|good|awesome|excited/i.test(lowercaseContent)) {
      setMood('happy');
      setSuggestedResponses([
        "That's awesome! I'm happy for you!",
        "Great to hear that!",
        "That made my day too!"
      ]);
    } else if (/sad|unhappy|depressed|bad|terrible|worried|anxious/i.test(lowercaseContent)) {
      setMood('sad');
      setSuggestedResponses([
        "I'm sorry to hear that. Want to talk about it?",
        "That sounds tough. I'm here for you.",
        "Sending you positive thoughts."
      ]);
    } else if (/exciting|thrilled|amazing|wow/i.test(lowercaseContent)) {
      setMood('excited');
      setSuggestedResponses([
        "Wow, that's incredible!",
        "Tell me more!",
        "I'm so excited for you!"
      ]);
    } else {
      setMood('neutral');
      setSuggestedResponses([
        "That's interesting.",
        "Tell me more about that.",
        "How are you feeling about that?"
      ]);
    }
  };
  
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
    
    // Get encryption key for selected friend
    const encryptionKey = encryptionKeys[selectedFriend];
    
    // Encrypt message
    const encryptedContent = encrypt(messageText, encryptionKey);
    
    // Create message object
    const messageObj = {
      senderId: user.id,
      receiverId: selectedFriend,
      content: messageText,
      encrypted: true
    };
    
    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        ...messageObj,
        content: encryptedContent, // Send encrypted content
        timestamp: Date.now()
      }));
    }
    
    // Reset state
    setMessageText('');
    setIsTyping(false);
    
    // Stop typing indicator
    sendTypingIndicator(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    
    // Reset the timeout
    if (typingTimeoutRef.current[selectedFriend || '']) {
      clearTimeout(typingTimeoutRef.current[selectedFriend || '']);
    }
    
    // Set new timeout - send typing stopped after 2 seconds of inactivity
    typingTimeoutRef.current[selectedFriend || ''] = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };
  
  const sendTypingIndicator = (isTyping: boolean) => {
    if (!selectedFriend) return;
    
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        senderId: user.id,
        receiverId: selectedFriend,
        isTyping
      }));
    }
  };
  
  const useSuggestedResponse = (response: string) => {
    setMessageText(response);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const friendMessages = messages.filter(
    message => 
      (message.senderId === user.id && message.receiverId === selectedFriend) ||
      (message.senderId === selectedFriend && message.receiverId === user.id)
  ).sort((a, b) => a.timestamp - b.timestamp);
  
  const selectedFriendData = user.friends.find(friend => friend.id === selectedFriend);
  
  // Animations
  const messageAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 }
  };
  
  const typingAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };
  
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
                          friend.status === 'online' || friendTyping[friend.id] ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="ml-3">
                        <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {friend.name}
                          {friendTyping[friend.id] && (
                            <span className="ml-2 text-xs text-green-500 animate-pulse">
                              typing...
                            </span>
                          )}
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
                          {friendTyping[selectedFriend] && (
                            <span className="ml-2 text-xs text-green-500 animate-pulse">
                              typing...
                            </span>
                          )}
                        </div>
                        <div className={`text-xs flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedFriendData?.status === 'online' ? 'Online' : 'Offline'}
                          <Lock size={12} className="ml-2 mr-1" />
                          <span>End-to-End Encrypted</span>
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
                            
                            <motion.div 
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              variants={messageAnimation}
                              layout
                            >
                              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isUser
                                  ? darkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white'
                                  : darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                              }`}>
                                <p>{message.content}</p>
                                <div className={`text-xs mt-1 flex items-center justify-end ${
                                  isUser
                                    ? 'text-purple-200'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {formatTime(message.timestamp)}
                                  {isUser && message.read && (
                                    <span className="ml-1 text-xs">✓</span>
                                  )}
                                  <Shield size={10} className="ml-1" />
                                </div>
                              </div>
                            </motion.div>
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
                    {friendTyping[selectedFriend || ''] && (
                      <motion.div 
                        className="flex justify-start"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={typingAnimation}
                      >
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                        }`}>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Suggested responses */}
                  {suggestedResponses.length > 0 && (
                    <div className="px-3 py-2 overflow-x-auto whitespace-nowrap">
                      <AnimatePresence>
                        {suggestedResponses.map((response, index) => (
                          <motion.button
                            key={index}
                            onClick={() => useSuggestedResponse(response)}
                            className={`mr-2 px-3 py-1 rounded-full text-sm whitespace-normal ${
                              darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            } transition-colors inline-block`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {response}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Mood indicator */}
                  <div className={`px-3 py-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <Activity size={14} className={`mr-1 ${
                        mood === 'happy' 
                          ? 'text-green-500' 
                          : mood === 'sad' 
                            ? 'text-blue-500' 
                            : mood === 'excited' 
                              ? 'text-yellow-500' 
                              : 'text-gray-400'
                      }`} />
                      <span className="text-xs text-gray-500">
                        Conversation mood: {mood}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex">
                      <input
                        type="text"
                        value={messageText}
                        onChange={handleInputChange}
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
                      <button
                        className={`p-2 ${
                          darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <Smile size={20} />
                      </button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="rounded-l-none"
                        icon={<Send size={16} />}
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