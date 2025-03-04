import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Phone, Info, Paperclip } from 'lucide-react';
import useStore from '../../store/useStore';

interface ChatInterfaceProps {
  doctorName: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ doctorName }) => {
  const { darkMode } = useStore();
  const [messages, setMessages] = useState<{sender: string; text: string; timestamp: Date}[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        sender: 'system',
        text: 'Your chat consultation has started',
        timestamp: new Date()
      },
      {
        sender: 'doctor',
        text: `Hello, I'm Dr. ${doctorName.split(' ')[0]}. How are you doing today?`,
        timestamp: new Date()
      }
    ]);
  }, [doctorName]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    // Add the user's message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: messageInput,
      timestamp: new Date()
    }]);
    
    setMessageInput('');
    
    // Simulate doctor reply after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'doctor',
        text: "I understand. Let's discuss this further. Could you tell me more about your symptoms?",
        timestamp: new Date()
      }]);
    }, 2000);
  };
  
  return (
    <div className="h-[600px] flex flex-col">
      {/* Chat header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
          }`}>
            <User size={20} />
          </div>
          <div>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {doctorName}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Online • Consultation in progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className={`p-2 rounded-full ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}>
            <Phone size={18} />
          </button>
          <button className={`p-2 rounded-full ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}>
            <Info size={18} />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className={`flex-1 p-4 overflow-y-auto ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              message.sender === 'system' ? 'text-center' : ''
            }`}
          >
            {message.sender === 'system' ? (
              <div className={`text-xs py-1 px-3 rounded-full inline-block ${
                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
              }`}>
                {message.text}
              </div>
            ) : (
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'doctor' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                    darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <User size={16} />
                  </div>
                )}
                
                <div className={`
                  max-w-[75%] p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? `${darkMode ? 'bg-purple-600' : 'bg-purple-500'} text-white` 
                      : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                  }
                `}>
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 text-right ${
                    message.sender === 'user' 
                      ? 'text-purple-200' 
                      : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {message.sender === 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 ${
                    darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <User size={16} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <form 
        onSubmit={sendMessage}
        className={`p-3 border-t ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        <div className="relative flex items-center">
          <button 
            type="button"
            className={`absolute left-2 p-2 rounded-full ${
              darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="text" 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className={`w-full py-2 pl-10 pr-12 rounded-full ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-800'
            } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            placeholder="Type your message..."
          />
          
          <button 
            type="submit"
            className="absolute right-2 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;