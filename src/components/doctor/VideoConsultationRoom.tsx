import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Camera, CameraOff, PhoneOff, 
  MessageSquare, Users, Share2, Settings
} from 'lucide-react';
import Button from '../ui/Button';
import useStore from '../../store/useStore';

interface VideoConsultationRoomProps {
  doctorName: string;
}

const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({ doctorName }) => {
  const { darkMode, user } = useStore();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string; text: string; timestamp: Date}[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const doctorVideoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // In a real application, this would use WebRTC to connect to the doctor
    // For this demo, we'll just show a placeholder with the user's camera
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing media devices:", err);
        });
    }
    
    // Simulate doctor joining after 2 seconds
    const timer = setTimeout(() => {
      addSystemMessage(`Dr. ${doctorName.split(' ')[0]} has joined the consultation`);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      
      // Stop all media tracks when component unmounts
      if (userVideoRef.current && userVideoRef.current.srcObject) {
        const stream = userVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [doctorName]);
  
  const toggleMic = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };
  
  const toggleCamera = () => {
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };
  
  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      sender: 'system',
      text,
      timestamp: new Date()
    }]);
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
        text: "I'm looking at your information. How have you been feeling this week?",
        timestamp: new Date()
      }]);
    }, 2000);
  };
  
  return (
    <div className="h-[600px] flex flex-col">
      {/* Video grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* User video */}
        <div className={`relative rounded-lg overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <video 
            ref={userVideoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-sm py-1 px-2 rounded">
            You
          </div>
          {(!isCameraOn || !isMicOn) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {!isCameraOn && (
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  <CameraOff size={40} className="text-red-500" />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Doctor video (placeholder) */}
        <div className={`relative rounded-lg overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-2xl font-bold ${
              darkMode ? 'bg-gray-700 text-purple-400' : 'bg-gray-200 text-purple-600'
            }`}>
              {doctorName.split(' ').map(name => name[0]).join('')}
            </div>
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Dr. {doctorName.split(' ')[0]}
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              Connecting...
            </p>
          </div>
          
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-sm py-1 px-2 rounded">
            {doctorName}
          </div>
        </div>
      </div>
      
      {/* Chat sidebar - conditionally rendered */}
      {isChatOpen && (
        <div className={`h-full absolute top-0 right-0 w-80 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } shadow-lg border-l ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } flex flex-col`}>
          <div className={`p-3 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } flex justify-between items-center`}>
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Chat
            </h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${
                  message.sender === 'system' ? 'text-center' : ''
                }`}
              >
                {message.sender === 'system' ? (
                  <div className={`text-xs py-1 px-2 rounded inline-block ${
                    darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {message.text}
                  </div>
                ) : (
                  <div className={`
                    max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? `${darkMode ? 'bg-purple-600' : 'bg-purple-500'} text-white ml-auto` 
                        : darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' 
                        ? 'text-purple-200' 
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <form 
            onSubmit={sendMessage}
            className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex">
              <input 
                type="text" 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className={`flex-1 p-2 rounded-l-lg ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                placeholder="Type a message..."
              />
              <button 
                type="submit"
                className="bg-purple-600 text-white px-4 rounded-r-lg hover:bg-purple-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Control bar */}
      <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex justify-center items-center`}>
        <div className="flex space-x-2 sm:space-x-4">
          {/* Mic toggle */}
          <button 
            onClick={toggleMic}
            className={`p-3 rounded-full ${
              isMicOn
                ? darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                : 'bg-red-500 text-white'
            } hover:opacity-90 transition`}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </button>
          
          {/* Camera toggle */}
          <button 
            onClick={toggleCamera}
            className={`p-3 rounded-full ${
              isCameraOn
                ? darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                : 'bg-red-500 text-white'
            } hover:opacity-90 transition`}
          >
            {isCameraOn ? <Camera /> : <CameraOff />}
          </button>
          
          {/* End call */}
          <button 
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            onClick={() => window.confirm("End consultation?") && window.history.back()}
          >
            <PhoneOff />
          </button>
          
          {/* Chat toggle */}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full ${
              isChatOpen
                ? 'bg-purple-600 text-white'
                : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } hover:opacity-90 transition`}
          >
            <MessageSquare />
          </button>
          
          {/* Settings */}
          <button 
            className={`p-3 rounded-full ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            } hover:opacity-90 transition`}
          >
            <Settings />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultationRoom;