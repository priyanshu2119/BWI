import React from 'react';
import { motion } from 'framer-motion';
import { Frown, Meh, Smile, Wind, Zap } from 'lucide-react';
import { Mood } from '../../types';
import useStore from '../../store/useStore';
import Button from './Button';

interface MoodSelectorProps {
  onSelect?: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  onSelect,
  size = 'md',
  className = ''
}) => {
  const { currentMood, setCurrentMood } = useStore();
  
  const handleSelect = (mood: Mood) => {
    setCurrentMood(mood);
    if (onSelect) onSelect(mood);
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 24;
      case 'lg': return 36;
      default: return 24;
    }
  };
  
  const iconSize = getIconSize();
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="secondary"
        selected={currentMood === 'sad'}
        mood="sad"
        onClick={() => handleSelect('sad')}
        icon={<Frown size={iconSize} />}
        size={size}
      >
        {size !== 'sm' && 'Sad'}
      </Button>
      
      <Button
        variant="secondary"
        selected={currentMood === 'neutral'}
        mood="neutral"
        onClick={() => handleSelect('neutral')}
        icon={<Meh size={iconSize} />}
        size={size}
      >
        {size !== 'sm' && 'Neutral'}
      </Button>
      
      <Button
        variant="secondary"
        selected={currentMood === 'happy'}
        mood="happy"
        onClick={() => handleSelect('happy')}
        icon={<Smile size={iconSize} />}
        size={size}
      >
        {size !== 'sm' && 'Happy'}
      </Button>

      <Button
        variant="secondary"
        selected={currentMood === 'anxious'}
        mood="anxious"
        onClick={() => handleSelect('anxious')}
        icon={<Wind size={iconSize} />}
        size={size}
      >
        {size !== 'sm' && 'Anxious'}
      </Button>

      <Button
        variant="secondary"
        selected={currentMood === 'stressed'}
        mood="stressed"
        onClick={() => handleSelect('stressed')}
        icon={<Zap size={iconSize} />}
        size={size}
      >
        {size !== 'sm' && 'Stressed'}
      </Button>
    </div>
  );
};

export default MoodSelector;