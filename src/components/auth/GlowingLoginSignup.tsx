import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, User, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import useStore from '../../store/useStore';

interface GlowingLoginSignupProps {
  onClose: () => void;
  onComplete: () => void;
  accentColors: string[];
}

// This is a simplified version of what would be in step 3
const loginUser = async (credentials: { username: string; password: string }) => {
  // Simulate API call delay
  return new Promise<{success: boolean}>((resolve) => {
    setTimeout(() => {
      // In a real app, you would validate credentials against a backend
      resolve({ success: true });
    }, 1000);
  });
};

const createUserAccount = async (data: { 
  fullName: string;
  username: string;
  email: string;
  password: string;
}) => {
  // Simulate API call delay
  return new Promise<{success: boolean}>((resolve) => {
    setTimeout(() => {
      // In a real app, you would send signup data to your backend
      resolve({ success: true });
    }, 1000);
  });
};

const GlowingLoginSignup: React.FC<GlowingLoginSignupProps> = ({ onClose, onComplete, accentColors }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Derive colors from the current mood
  const primaryColor = accentColors[0];
  const secondaryColor = accentColors[1];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate form
      const newErrors: {[key: string]: string} = {};
      
      if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (isSignUp && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }
      
      // Proceed with authentication
      if (isSignUp) {
        await createUserAccount({
          fullName,
          username,
          email,
          password
        });
        
        // Set user in store
        const { setUser } = useStore.getState();
        setUser({
          id: Math.random().toString(),
          name: username,
          xp: 0,
          streak: 1,
          lastActive: new Date().toISOString(),
          isAuthenticated: true
        });
      } else {
        await loginUser({
          username,
          password
        });
        
        // Set user in store
        const { setUser } = useStore.getState();
        setUser({
          id: Math.random().toString(),
          name: username,
          xp: 120,
          streak: 3,
          lastActive: new Date().toISOString(),
          isAuthenticated: true
        });
      }
      
      // Complete the login flow
      onComplete();
    } catch (error) {
      setErrors({ form: "Authentication failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const containerVariants = {
    small: {
      width: '120px',
      height: '120px',
      borderRadius: '24px',
      y: [0, -10, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut'
        }
      }
    },
    expanded: {
      width: '400px',
      height: isSignUp ? '550px' : '400px',
      borderRadius: '24px',
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100
      }
    }
  };
  
  const glowVariants = {
    initial: {
      boxShadow: `0 0 15px 2px ${primaryColor}33, 0 0 30px 5px ${secondaryColor}22`
    },
    hover: {
      boxShadow: `0 0 25px 5px ${primaryColor}66, 0 0 40px 10px ${secondaryColor}44`
    }
  };
  
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  };
  
  // Update the flashcard variants for better animations
  const flashcardVariants = {
    initial: { opacity: 0, y: 50, rotateY: 15, rotateX: 15 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      rotateY: [-5, 5, -5],
      rotateX: [3, -3, 3],
      z: i * 15, // Creates a stacked effect
      transition: {
        delay: 0.3 + i * 0.1,
        opacity: { duration: 0.5 },
        y: { duration: 0.5 },
        rotateY: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 6 + i * 0.5,
          ease: "easeInOut"
        },
        rotateX: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 5 + i * 0.5,
          ease: "easeInOut"
        }
      }
    }),
    hover: {
      scale: 1.05,
      rotateY: [-10, 10, -10],
      rotateX: [-5, 5, -5],
      transition: { duration: 0.3 }
    }
  };

  const flashcards = [
    { title: "Track Moods", content: "Log daily emotions" },
    { title: "Get Support", content: "Connect with peers" },
    { title: "Relaxation", content: "Audio & exercises" },
    { title: "Resources", content: "Expert guidance" },
  ];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <motion.div 
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isExpanded && onClose()}
      />
      
      <motion.div
        className="relative"
        initial="small"
        animate={isExpanded ? "expanded" : "small"}
        variants={containerVariants}
        onMouseEnter={() => !isExpanded && setIsExpanded(true)}
        whileHover={!isExpanded ? "hover" : undefined}
        variants={glowVariants}
        style={{ 
          background: `rgba(18, 18, 30, 0.8)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.3)`,
          willChange: 'transform, opacity, box-shadow'
        }}
      >
        {!isExpanded && (
          <motion.div 
            className="h-full w-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{
                filter: [
                  `drop-shadow(0 0 8px ${primaryColor})`, 
                  `drop-shadow(0 0 15px ${secondaryColor})`,
                  `drop-shadow(0 0 8px ${primaryColor})`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock size={40} color={primaryColor} />
            </motion.div>
          </motion.div>
        )}
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="p-8 w-full h-full"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={formVariants}
            >
              <motion.button 
                className="absolute top-4 left-4 text-gray-400 hover:text-white"
                variants={itemVariants}
                onClick={() => {
                  setIsExpanded(false);
                  setIsSignUp(false);
                }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <motion.h2 
                className="text-2xl font-bold mb-6 text-center"
                variants={itemVariants}
                style={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </motion.h2>
              
              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <>
                    <motion.div className="mb-4" variants={itemVariants}>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          className="w-full bg-gray-800 bg-opacity-50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 border border-gray-700 focus:border-opacity-50 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
                          placeholder="Full Name"
                          style={{ 
                            borderColor: primaryColor + '40', 
                            boxShadow: `0 0 5px ${primaryColor}33` 
                          }}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                  </>
                )}
                
                <motion.div className="mb-4" variants={itemVariants}>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      className="w-full bg-gray-800 bg-opacity-50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 border border-gray-700 focus:border-opacity-50 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
                      placeholder="Username"
                      style={{ 
                        borderColor: primaryColor + '40', 
                        boxShadow: `0 0 5px ${primaryColor}33` 
                      }}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
                
                {isSignUp && (
                  <motion.div className="mb-4" variants={itemVariants}>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        className="w-full bg-gray-800 bg-opacity-50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 border border-gray-700 focus:border-opacity-50 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
                        placeholder="Email Address"
                        style={{ 
                          borderColor: primaryColor + '40', 
                          boxShadow: `0 0 5px ${primaryColor}33` 
                        }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </motion.div>
                )}
                
                <motion.div className="mb-4" variants={itemVariants}>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      className="w-full bg-gray-800 bg-opacity-50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 border border-gray-700 focus:border-opacity-50 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
                      placeholder="Password"
                      style={{ 
                        borderColor: primaryColor + '40', 
                        boxShadow: `0 0 5px ${primaryColor}33` 
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {errors.password && (
                    <motion.p 
                      initial={{opacity: 0, y: -10}} 
                      animate={{opacity: 1, y: 0}}
                      className="text-red-400 text-xs mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>
                
                {isSignUp && (
                  <motion.div className="mb-4" variants={itemVariants}>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="password"
                        className="w-full bg-gray-800 bg-opacity-50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 border border-gray-700 focus:border-opacity-50 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
                        placeholder="Confirm Password"
                        style={{ 
                          borderColor: primaryColor + '40', 
                          boxShadow: `0 0 5px ${primaryColor}33` 
                        }}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p 
                        initial={{opacity: 0, y: -10}} 
                        animate={{opacity: 1, y: 0}}
                        className="text-red-400 text-xs mt-1"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>
                )}
                
                {errors.form && (
                  <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="mb-4 p-2 bg-red-500 bg-opacity-20 border border-red-400 rounded-md"
                  >
                    <p className="text-red-400 text-sm text-center">{errors.form}</p>
                  </motion.div>
                )}
                
                <motion.div className="mt-6" variants={itemVariants}>
                  <motion.button
                    type="submit"
                    className="w-full bg-transparent bg-opacity-20 border border-opacity-40 rounded-lg py-3 text-white font-medium transition-all hover:bg-opacity-30 flex items-center justify-center"
                    style={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 10px ${primaryColor}66` 
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: `0 0 15px ${primaryColor}99` 
                    }}
                    whileTap={{ scale: 0.98 }}
                    variants={itemVariants}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <User size={18} className="mr-2" style={{ color: primaryColor }} />
                        <span 
                          className="font-bold tracking-wider"
                          style={{ 
                            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text' 
                          }}
                        >
                          {isSignUp ? 'SIGNUP' : 'LOGIN'}
                        </span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
              
              <motion.div className="mt-4 text-center" variants={itemVariants}>
                {isSignUp ? (
                  <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <button
                      className="text-blue-400 hover:text-blue-300 transition"
                      onClick={() => setIsSignUp(false)}
                      style={{ color: primaryColor }}
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">
                      <button 
                        className="hover:text-blue-300 transition"
                        style={{ color: primaryColor }}
                      >
                        Forgot password?
                      </button>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Don't have an account?{' '}
                      <button
                        className="hover:text-blue-300 transition"
                        onClick={() => setIsSignUp(true)}
                        style={{ color: primaryColor }}
                      >
                        Sign Up
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Update the bottom flashcards section to make them bigger and more stylish */}
      <div className="absolute bottom-4 flex justify-center w-full space-x-4 pointer-events-none">
        {flashcards.map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={flashcardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-white w-[160px] shadow-xl"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}ee, ${secondaryColor}ee)`,
              transformStyle: "preserve-3d",
              perspective: "1000px",
              boxShadow: `0 10px 25px rgba(0,0,0,0.2), 0 0 8px ${primaryColor}66, inset 0 1px 1px rgba(255,255,255,0.2)`,
              border: `1px solid ${primaryColor}44`,
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
            }}
          >
            <h4 className="text-base font-bold mb-2" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
              {card.title}
            </h4>
            <p className="text-sm opacity-90" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
              {card.content}
            </p>
            
            {/* Add a subtle shine effect */}
            <div 
              className="absolute inset-0 rounded-lg opacity-20"
              style={{
                background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 55%, transparent 100%)',
                transform: 'translateY(-100%)',
                animation: `shine-${i} 3s infinite`,
              }}
            />
            
            <style jsx>{`
              @keyframes shine-${i} {
                0% { transform: translateY(-100%) }
                20% { transform: translateY(100%) }
                100% { transform: translateY(100%) }
              }
            `}</style>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GlowingLoginSignup;