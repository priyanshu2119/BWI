import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import useStore from '../../store/useStore';
import Card from '../ui/Card';
import { Mood } from '../../types';

const MoodChart: React.FC = () => {
  const { user, darkMode } = useStore();
  
  // Convert mood to numeric value for the chart
  const getMoodValue = (mood: Mood): number => {
    switch (mood) {
      case 'sad': return 1;
      case 'neutral': return 2;
      case 'happy': return 3;
      default: return 0;
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Prepare data for the chart
  const chartData = user.moodEntries
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(entry => ({
      date: formatDate(entry.timestamp),
      mood: getMoodValue(entry.mood),
      timestamp: entry.timestamp
    }));
  
  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const moodValue = payload[0].value;
      let moodText = '';
      let moodColor = '';
      
      switch (moodValue) {
        case 1:
          moodText = 'Sad';
          moodColor = darkMode ? 'text-indigo-400' : 'text-indigo-600';
          break;
        case 2:
          moodText = 'Neutral';
          moodColor = darkMode ? 'text-blue-400' : 'text-blue-600';
          break;
        case 3:
          moodText = 'Happy';
          moodColor = darkMode ? 'text-emerald-400' : 'text-emerald-600';
          break;
      }
      
      const date = new Date(payload[0].payload.timestamp);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return (
        <Card variant="glass" className="p-2">
          <p className="text-sm">{formattedDate} at {formattedTime}</p>
          <p className={`text-sm font-bold ${moodColor}`}>Mood: {moodText}</p>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="w-full h-64 md:h-80">
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        Mood History
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
          <XAxis 
            dataKey="date" 
            stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
          />
          <YAxis 
            domain={[0, 4]} 
            ticks={[1, 2, 3]} 
            tickFormatter={(value) => {
              switch (value) {
                case 1: return 'Sad';
                case 2: return 'Neutral';
                case 3: return 'Happy';
                default: return '';
              }
            }}
            stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="mood" 
            stroke={darkMode ? '#8B5CF6' : '#6D28D9'} 
            strokeWidth={2}
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MoodChart;