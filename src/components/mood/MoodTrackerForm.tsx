import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Frown, Meh, Smile } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';
import { Mood } from '../../types';
import { getMoodTextColor } from '../../utils/theme';

const MoodTrackerForm: React.FC = () => {
  const { addMoodEntry, currentMood, darkMode } = useStore();
  const [selectedMood, setSelectedMood] = useState<Mood>(currentMood);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const textColorClass = getMoodTextColor(selectedMood, darkMode);
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addMoodEntry({
        mood: selectedMood,
        note: note.trim() || undefined
      });
      
      setNote('');
      setIsSubmitting(false);
    }, 500);
  };
  
  const getMoodEmoji = (mood: Mood) => {
    switch (mood) {
      case 'sad': return <Frown size={64} />;
      case 'neutral': return <Meh size={64} />;
      case 'happy': return <Smile size={64} />;
    }
  };
  
  const getMoodTitle = (mood: Mood) => {
    switch (mood) {
      case 'sad': return 'Feeling Low';
      case 'neutral': return 'Feeling Okay';
      case 'happy': return 'Feeling Great';
    }
  };
  
  const moodOptions = [
    { value: 'sad', icon: <Frown size={32} />, label: 'Sad' },
    { value: 'neutral', icon: <Meh size={32} />, label: 'Neutral' },
    { value: 'happy', icon: <Smile size={32} />, label: 'Happy' }
  ] as const;
  
  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        How are you feeling today?
      </h2>
      
      <div className="flex flex-col items-center mb-8">
        <motion.div
          key={selectedMood}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 ${textColorClass}`}
        >
          {getMoodEmoji(selectedMood)}
        </motion.div>
        
        <motion.h3
          key={`title-${selectedMood}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-xl font-medium ${textColorClass}`}
        >
          {getMoodTitle(selectedMood)}
        </motion.h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {moodOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => setSelectedMood(option.value)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors duration-200 ${
              selectedMood === option.value
                ? `${option.value === 'sad' ? 'bg-indigo-100 dark:bg-indigo-900' : 
                    option.value === 'neutral' ? 'bg-blue-100 dark:bg-blue-900' : 
                    'bg-emerald-100 dark:bg-emerald-900'}`
                : `${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={selectedMood === option.value ? getMoodTextColor(option.value, darkMode) : ''}>
              {option.icon}
            </span>
            <span className={`mt-2 font-medium ${
              selectedMood === option.value ? getMoodTextColor(option.value, darkMode) : ''
            }`}>
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>
      
      <div className="mb-6">
        <label 
          htmlFor="note" 
          className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Add a note (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How are you feeling? What's on your mind?"
          className={`w-full p-3 rounded-lg ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } border focus:ring-2 focus:outline-none ${
            selectedMood === 'sad' ? 'focus:ring-indigo-500' : 
            selectedMood === 'neutral' ? 'focus:ring-blue-500' : 
            'focus:ring-emerald-500'
          }`}
          rows={4}
        />
      </div>
      
      <Button
        onClick={handleSubmit}
        fullWidth
        disabled={isSubmitting}
        className="py-3"
      >
        {isSubmitting ? 'Saving...' : 'Save Mood Entry'}
      </Button>
    </Card>
  );
};

export default MoodTrackerForm;