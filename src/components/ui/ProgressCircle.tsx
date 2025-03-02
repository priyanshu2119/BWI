import React from 'react';
import { motion } from 'framer-motion';
import { getMoodAccentColor } from '../../utils/theme';
import useStore from '../../store/useStore';
import { Mood } from '../../types';

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  mood?: Mood;
  children?: React.ReactNode;
  className?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  mood,
  children,
  className = ''
}) => {
  const { currentMood, darkMode } = useStore();
  const moodToUse = mood || currentMood;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const accentColor = getMoodAccentColor(moodToUse, darkMode).split(' ')[0].replace('text', 'stroke');
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={darkMode ? '#374151' : '#E5E7EB'}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          fill="none"
          className={accentColor}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference,
            transformOrigin: 'center',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressCircle;