import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map, Save, Info } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

const BodyMap: React.FC = () => {
  const { user, addBodyMapPoint, darkMode, currentMood } = useStore();
  const [intensity, setIntensity] = useState(5);
  const [points, setPoints] = useState<Array<{x: number, y: number, intensity: number}>>([]);
  const [showInfo, setShowInfo] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPoints([...points, { x, y, intensity }]);
  };
  
  const handleSave = () => {
    const moodEntryId = uuidv4();
    points.forEach(point => {
      addBodyMapPoint(moodEntryId, point);
    });
    
    // Reset points after saving
    setPoints([]);
    setShowInfo(true);
  };
  
  const getIntensityColor = (value: number) => {
    const colors = {
      low: darkMode ? 'bg-blue-700' : 'bg-blue-400',
      medium: darkMode ? 'bg-yellow-600' : 'bg-yellow-400',
      high: darkMode ? 'bg-red-700' : 'bg-red-500'
    };
    
    if (value <= 3) return colors.low;
    if (value <= 7) return colors.medium;
    return colors.high;
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Body Map
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Track where you feel physical stress or tension in your body.
        </motion.p>
        
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-blue-50'} flex items-start`}
          >
            <Info size={20} className={`mr-3 flex-shrink-0 mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <h3 className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                How to use the Body Map
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                1. Adjust the intensity slider to indicate stress level<br />
                2. Click on the body outline where you feel tension or stress<br />
                3. Add multiple points if needed<br />
                4. Save your body map when finished
              </p>
              <button 
                onClick={() => setShowInfo(false)}
                className={`text-sm mt-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <div 
                ref={mapRef}
                onClick={handleMapClick}
                className="relative w-full h-[500px] cursor-crosshair"
              >
                {/* Body outline SVG */}
                <svg 
                  viewBox="0 0 100 100" 
                  className={`absolute inset-0 w-full h-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <path 
                    d="M50,10 C45,10 40,15 40,20 C40,25 45,30 50,30 C55,30 60,25 60,20 C60,15 55,10 50,10 Z" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"
                  />
                  <path 
                    d="M50,30 L50,70 M40,30 L30,50 L40,70 M60,30 L70,50 L60,70 M40,70 L40,90 M60,70 L60,90" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"
                  />
                  <path 
                    d="M40,70 C40,75 60,75 60,70" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"
                  />
                </svg>
                
                {/* Render points */}
                {points.map((point, index) => (
                  <motion.div
                    key={index}
                    className={`absolute rounded-full ${getIntensityColor(point.intensity)}`}
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${point.intensity * 3}px`,
                      height: `${point.intensity * 3}px`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                  />
                ))}
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Stress Intensity
              </h3>
              
              <div className="mb-6">
                <label 
                  htmlFor="intensity" 
                  className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Intensity Level: {intensity}
                </label>
                <input
                  type="range"
                  id="intensity"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${
                      intensity <= 3 ? (darkMode ? '#3B82F6' : '#60A5FA') :
                      intensity <= 7 ? (darkMode ? '#F59E0B' : '#FBBF24') :
                      (darkMode ? '#EF4444' : '#F87171')
                    } ${(intensity / 10) * 100}%, ${
                      darkMode ? '#374151' : '#e5e7eb'
                    } 0)`,
                  }}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>Mild</span>
                  <span className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}>Moderate</span>
                  <span className={darkMode ? 'text-red-400' : 'text-red-600'}>Severe</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Current Mood
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Points Added
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {points.length}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={points.length === 0}
                  fullWidth
                  icon={<Save size={16} />}
                >
                  Save Body Map
                </Button>
                
                <Button
                  onClick={() => setPoints([])}
                  variant="outline"
                  disabled={points.length === 0}
                  fullWidth
                >
                  Clear All Points
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BodyMap;