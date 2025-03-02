import React from 'react';
import { motion } from 'framer-motion';
import { getMoodAccentColor, getMoodButtonColor } from '../../utils/theme';
import useStore from '../../store/useStore';
import { Mood } from '../../types';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  mood?: Mood;
  selected?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  mood,
  selected = false,
  className = '',
  icon,
  fullWidth = false,
  disabled = false
}) => {
  const { currentMood, darkMode } = useStore();
  const moodToUse = mood || currentMood;

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return darkMode 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white';
      case 'secondary':
        return getMoodButtonColor(moodToUse, selected, darkMode);
      case 'outline':
        return `bg-transparent ${getMoodAccentColor(moodToUse, darkMode)} hover:bg-opacity-10 hover:bg-gray-500`;
      case 'ghost':
        return 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-1 px-2';
      case 'md':
        return 'text-sm py-2 px-4';
      case 'lg':
        return 'text-base py-3 px-6';
      default:
        return '';
    }
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-medium transition-all duration-200 ease-in-out
        flex items-center justify-center gap-2
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;