import React from 'react';
import { motion } from 'framer-motion';

interface MoodTrackerPanelProps {
  moodConfig: any;
  darkMode: boolean;
  moodData: {
    dailyMoodPercentage: number;
    dominantMood: string;
    moodInsight: string;
  };
}

const MoodTrackerPanel: React.FC<MoodTrackerPanelProps> = ({
  moodConfig,
  darkMode,
  moodData
}) => {
  const percentage = moodData.dailyMoodPercentage;
  const circumference = 2 * Math.PI * 40; // Circle radius is 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className={`rounded-xl shadow-lg p-6 ${moodConfig.cardBg} border ${moodConfig.accentBorder}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={`text-xl font-semibold mb-3 ${moodConfig.accentColor}`}>
        Mood Tracker
      </h2>

      <div className="flex items-center justify-between">
        <div className="relative w-28 h-28">
          <motion.svg
            width="112"
            height="112"
            viewBox="0 0 112 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle
              cx="56"
              cy="56"
              r="40"
              stroke={darkMode ? "#374151" : "#E5E7EB"}
              strokeWidth="8"
              fill="none"
            />
            
            {/* Progress circle with animation */}
            <motion.circle
              cx="56"
              cy="56"
              r="40"
              stroke={
                moodData.dominantMood === "happy" ? "#F59E0B" :
                moodData.dominantMood === "sad" ? "#8B5CF6" :
                moodData.dominantMood === "stressed" ? "#EF4444" :
                moodData.dominantMood === "anxious" ? "#F97316" : "#14B8A6" // neutral
              }
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              transform="rotate(-90 56 56)"
            />

            {/* Percentage text */}
            <text
              x="56"
              y="56"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="18"
              fontWeight="bold"
              fill={darkMode ? "white" : "#374151"}
            >
              {percentage}%
            </text>
            
            <text
              x="56"
              y="72"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="10"
              fill={darkMode ? "#E5E7EB" : "#6B7280"}
            >
              {moodData.dominantMood}
            </text>
          </motion.svg>
        </div>

        <div className="ml-4">
          <h3 className={`text-lg font-medium mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
            {percentage}% {moodData.dominantMood.charAt(0).toUpperCase() + moodData.dominantMood.slice(1)} Today
          </h3>
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {moodData.moodInsight}
          </p>
        </div>
      </div>
      
      <div className={`mt-4 p-3 rounded-lg bg-opacity-10 ${moodConfig.cardBg}`}>
        <p className={`text-sm italic ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          "{moodConfig.affirmation}"
        </p>
      </div>
    </motion.div>
  );
};

export default React.memo(MoodTrackerPanel);