import { Mood } from '../types';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMoodColor = (mood: Mood, darkMode: boolean): string => {
  if (darkMode) {
    switch (mood) {
      case 'happy':
        return 'bg-emerald-900';
      case 'neutral':
        return 'bg-blue-900';
      case 'sad':
        return 'bg-indigo-900';
      case 'anxious':
        return 'bg-purple-900';
      case 'stressed':
        return 'bg-orange-900';
      default:
        return 'bg-gray-900';
    }
  } else {
    switch (mood) {
      case 'happy':
        return 'bg-emerald-50';
      case 'neutral':
        return 'bg-blue-50';
      case 'sad':
        return 'bg-indigo-50';
      case 'anxious':
        return 'bg-purple-50';
      case 'stressed':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  }
};

export const getMoodGradient = (mood: Mood, darkMode: boolean): string => {
  if (darkMode) {
    switch (mood) {
      case 'happy':
        return 'bg-gradient-to-br from-emerald-800 to-emerald-950';
      case 'neutral':
        return 'bg-gradient-to-br from-blue-800 to-blue-950';
      case 'sad':
        return 'bg-gradient-to-br from-indigo-800 to-indigo-950';
      case 'anxious':
        return 'bg-gradient-to-br from-purple-800 to-purple-950';
      case 'stressed':
        return 'bg-gradient-to-br from-orange-800 to-orange-950';
      default:
        return 'bg-gradient-to-br from-gray-800 to-gray-950';
    }
  } else {
    switch (mood) {
      case 'happy':
        return 'bg-gradient-to-br from-emerald-100 to-emerald-300';
      case 'neutral':
        return 'bg-gradient-to-br from-blue-100 to-blue-300';
      case 'sad':
        return 'bg-gradient-to-br from-indigo-100 to-indigo-300';
      case 'anxious':
        return 'bg-gradient-to-br from-purple-100 to-purple-300';
      case 'stressed':
        return 'bg-gradient-to-br from-orange-100 to-orange-300';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-300';
    }
  }
};

export const getMoodAccentColor = (mood: Mood, darkMode: boolean): string => {
  if (darkMode) {
    switch (mood) {
      case 'happy':
        return 'text-emerald-400 border-emerald-400';
      case 'neutral':
        return 'text-blue-400 border-blue-400';
      case 'sad':
        return 'text-indigo-400 border-indigo-400';
      case 'anxious':
        return 'text-purple-400 border-purple-400';
      case 'stressed':
        return 'text-orange-400 border-orange-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  } else {
    switch (mood) {
      case 'happy':
        return 'text-emerald-600 border-emerald-600';
      case 'neutral':
        return 'text-blue-600 border-blue-600';
      case 'sad':
        return 'text-indigo-600 border-indigo-600';
      case 'anxious':
        return 'text-purple-600 border-purple-600';
      case 'stressed':
        return 'text-orange-600 border-orange-600';
      default:
        return 'text-gray-600 border-gray-600';
    }
  }
};

export const getMoodButtonColor = (mood: Mood, selected: boolean, darkMode: boolean): string => {
  if (!selected) return darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100';
  
  if (darkMode) {
    switch (mood) {
      case 'happy':
        return 'bg-emerald-700 hover:bg-emerald-600';
      case 'neutral':
        return 'bg-blue-700 hover:bg-blue-600';
      case 'sad':
        return 'bg-indigo-700 hover:bg-indigo-600';
      case 'anxious':
        return 'bg-purple-700 hover:bg-purple-600';
      case 'stressed':
        return 'bg-orange-700 hover:bg-orange-600';
      default:
        return 'bg-gray-700 hover:bg-gray-600';
    }
  } else {
    switch (mood) {
      case 'happy':
        return 'bg-emerald-200 hover:bg-emerald-300';
      case 'neutral':
        return 'bg-blue-200 hover:bg-blue-300';
      case 'sad':
        return 'bg-indigo-200 hover:bg-indigo-300';
      case 'anxious':
        return 'bg-purple-200 hover:bg-purple-300';
      case 'stressed':
        return 'bg-orange-200 hover:bg-orange-300';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  }
};

export const getMoodTextColor = (mood: Mood, darkMode: boolean): string => {
  if (darkMode) {
    switch (mood) {
      case 'happy':
        return 'text-emerald-400';
      case 'neutral':
        return 'text-blue-400';
      case 'sad':
        return 'text-indigo-400';
      case 'anxious':
        return 'text-purple-400';
      case 'stressed':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  } else {
    switch (mood) {
      case 'happy':
        return 'text-emerald-600';
      case 'neutral':
        return 'text-blue-600';
      case 'sad':
        return 'text-indigo-600';
      case 'anxious':
        return 'text-purple-600';
      case 'stressed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }
};

export const getGlassmorphismStyle = (darkMode: boolean): string => {
  return darkMode 
    ? 'bg-opacity-20 backdrop-blur-lg bg-gray-800 border border-gray-700'
    : 'bg-opacity-20 backdrop-blur-lg bg-white border border-gray-200';
};

export const getNeumorphismStyle = (darkMode: boolean): string => {
  return darkMode
    ? 'bg-gray-800 shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(30,30,30,0.2)]'
    : 'bg-gray-50 shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8)]';
};

export const getMoodBasedChallenge = (mood: Mood): string => {
  switch (mood) {
    case 'happy':
      return 'Share your positive energy with someone today';
    case 'neutral':
      return 'Try something new that might boost your mood';
    case 'sad':
      return 'Be gentle with yourself and do one small self-care activity';
    case 'anxious':
      return 'Practice 5 minutes of deep breathing to calm your nervous system';
    case 'stressed':
      return 'Take a short break and stretch your body to release tension';
    default:
      return 'Take 5 minutes for mindfulness today';
  }
};

export const getMoodBasedAffirmation = (mood: Mood): string => {
  switch (mood) {
    case 'happy':
      return 'Your positive energy is contagious. Spread it around!';
    case 'neutral':
      return 'Every moment is a fresh beginning. What will you create today?';
    case 'sad':
      return 'It\'s okay to not be okay. Your feelings are valid and temporary.';
    case 'anxious':
      return 'You are safe. This moment will pass, and you have the strength to handle it.';
    case 'stressed':
      return 'One step at a time. You don\'t have to do everything at once.';
    default:
      return 'You are exactly where you need to be right now.';
  }
};