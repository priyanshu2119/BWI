import React from 'react';
import { motion } from 'framer-motion';
import { getGlassmorphismStyle, getNeumorphismStyle } from '../../utils/theme';
import useStore from '../../store/useStore';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'neumorphic' | 'default';
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  animate = true
}) => {
  const { darkMode } = useStore();

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return getGlassmorphismStyle(darkMode);
      case 'neumorphic':
        return getNeumorphismStyle(darkMode);
      default:
        return darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200';
    }
  };

  const baseClasses = `
    rounded-xl p-4 transition-all duration-300
    ${getVariantClasses()}
    ${className}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  if (!animate) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -5, transition: { duration: 0.2 } } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default Card;