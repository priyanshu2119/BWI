import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Save, Info, Calendar, Activity, ArrowLeft, ArrowRight, Play, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

// Define body regions for targeted exercise suggestions
const bodyRegions = [
  { id: 'head', name: 'Head', bounds: { x1: 40, y1: 5, x2: 60, y2: 20 }, 
    exercises: ['Neck stretches', 'Scalp massage', 'Deep breathing', 'Meditation'] },
  { id: 'neck', name: 'Neck', bounds: { x1: 45, y1: 20, x2: 55, y2: 30 }, 
    exercises: ['Neck rolls', 'Shoulder shrugs', 'Chin tucks', 'Isometric neck strengthening'] },
  { id: 'chest', name: 'Chest', bounds: { x1: 40, y1: 30, x2: 60, y2: 45 }, 
    exercises: ['Chest stretches', 'Deep breathing', 'Doorway stretch', 'Pec deck butterflies'] },
  { id: 'abdomen', name: 'Abdomen', bounds: { x1: 40, y1: 45, x2: 60, y2: 60 }, 
    exercises: ['Gentle core rotations', 'Cat-cow stretch', 'Pelvic tilts', 'Deep breathing'] },
  { id: 'leftShoulder', name: 'Left Shoulder', bounds: { x1: 30, y1: 25, x2: 40, y2: 35 }, 
    exercises: ['Shoulder rolls', 'Wall angels', 'Cross-body stretch', 'Pendulum exercise'] },
  { id: 'rightShoulder', name: 'Right Shoulder', bounds: { x1: 60, y1: 25, x2: 70, y2: 35 }, 
    exercises: ['Shoulder rolls', 'Wall angels', 'Cross-body stretch', 'Pendulum exercise'] },
  { id: 'leftArm', name: 'Left Arm', bounds: { x1: 20, y1: 35, x2: 40, y2: 60 }, 
    exercises: ['Tricep stretches', 'Wrist flexor stretch', 'Arm circles', 'Tennis ball squeeze'] },
  { id: 'rightArm', name: 'Right Arm', bounds: { x1: 60, y1: 35, x2: 80, y2: 60 }, 
    exercises: ['Tricep stretches', 'Wrist flexor stretch', 'Arm circles', 'Tennis ball squeeze'] },
  { id: 'lowerBack', name: 'Lower Back', bounds: { x1: 40, y1: 60, x2: 60, y2: 70 }, 
    exercises: ['Child\'s pose', 'Cat-cow stretch', 'Pelvic tilts', 'Supine spinal twist'] },
  { id: 'leftLeg', name: 'Left Leg', bounds: { x1: 35, y1: 70, x2: 45, y2: 95 }, 
    exercises: ['Hamstring stretch', 'Quad stretch', 'Calf raises', 'Ankle rotations'] },
  { id: 'rightLeg', name: 'Right Leg', bounds: { x1: 55, y1: 70, x2: 65, y2: 95 }, 
    exercises: ['Hamstring stretch', 'Quad stretch', 'Calf raises', 'Ankle rotations'] },
];

// Define time periods for historical view
const timePeriods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const BodyMap: React.FC = () => {
  const { user, addBodyMapPoint, darkMode, currentMood } = useStore();
  const [intensity, setIntensity] = useState(5);
  const [points, setPoints] = useState<Array<{x: number, y: number, intensity: number}>>([]);
  const [showInfo, setShowInfo] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // New state variables for enhanced features
  const [viewMode, setViewMode] = useState<'points' | 'heatmap'>('points');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('today');
  const [historicalPoints, setHistoricalPoints] = useState<Array<{x: number, y: number, intensity: number, timestamp: number}>>([]);
  const [showExercises, setShowExercises] = useState(false);
  const [suggestedExercises, setSuggestedExercises] = useState<Array<{name: string, region: string}>>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [exerciseAnimation, setExerciseAnimation] = useState(false);
  
  // Generate mock historical data for demonstration
  useEffect(() => {
    // In a real app, this would come from your database
    const mockData = [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    // Generate some random historical points from various days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      mockData.push({
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 60,
        intensity: 1 + Math.floor(Math.random() * 10),
        timestamp: now - (daysAgo * dayInMs)
      });
    }
    
    setHistoricalPoints(mockData);
  }, []);

  // Filter historical points based on selected time period
  const filteredHistoricalPoints = useMemo(() => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    switch (selectedTimePeriod) {
      case 'today':
        return historicalPoints.filter(point => 
          point.timestamp > now - dayInMs
        );
      case 'week':
        return historicalPoints.filter(point => 
          point.timestamp > now - (7 * dayInMs)
        );
      case 'month':
        return historicalPoints.filter(point => 
          point.timestamp > now - (30 * dayInMs)
        );
      default:
        return historicalPoints;
    }
  }, [historicalPoints, selectedTimePeriod]);

  // Render the heatmap when in heatmap mode or when filtered data changes
  useEffect(() => {
    if (viewMode === 'heatmap' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas dimensions to match parent container
      if (mapRef.current) {
        canvas.width = mapRef.current.offsetWidth;
        canvas.height = mapRef.current.offsetHeight;
      }
      
      // Create heatmap
      filteredHistoricalPoints.forEach(point => {
        const x = (point.x / 100) * canvas.width;
        const y = (point.y / 100) * canvas.height;
        const radius = point.intensity * 15;
        
        // Create radial gradient for each point
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Set colors based on intensity
        if (point.intensity <= 3) {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');  // Blue
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else if (point.intensity <= 7) {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.8)');  // Yellow/Orange
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');   // Red
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }
        
        // Draw the heatmap point
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [viewMode, filteredHistoricalPoints, darkMode]);

  // Generate exercise suggestions based on points
  useEffect(() => {
    const allPoints = [...points, ...filteredHistoricalPoints];
    const regionPoints: Record<string, number> = {};
    
    // Count points in each region
    allPoints.forEach(point => {
      bodyRegions.forEach(region => {
        const { x1, y1, x2, y2 } = region.bounds;
        if (point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2) {
          regionPoints[region.id] = (regionPoints[region.id] || 0) + point.intensity;
        }
      });
    });
    
    // Find the top 3 regions with the most stress points
    const topRegions = Object.entries(regionPoints)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([regionId]) => regionId);
    
    // Generate exercise suggestions for these regions
    const exercises: Array<{name: string, region: string}> = [];
    
    topRegions.forEach(regionId => {
      const region = bodyRegions.find(r => r.id === regionId);
      if (region) {
        // Select 2 random exercises for this region
        const selectedExercises = [...region.exercises]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        
        selectedExercises.forEach(exercise => {
          exercises.push({
            name: exercise,
            region: region.name
          });
        });
      }
    });
    
    setSuggestedExercises(exercises);
  }, [points, filteredHistoricalPoints]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || viewMode === 'heatmap') return;
    
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
    
    // Add current points to historical data for immediate view
    const now = Date.now();
    const newHistoricalPoints = points.map(point => ({
      ...point,
      timestamp: now
    }));
    
    setHistoricalPoints([...historicalPoints, ...newHistoricalPoints]);
    
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

  // Helper to find region name from coordinates
  const getRegionFromCoordinates = (x: number, y: number): string => {
    for (const region of bodyRegions) {
      const { x1, y1, x2, y2 } = region.bounds;
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
        return region.name;
      }
    }
    return "General body";
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
                4. Save your body map when finished<br />
                5. Switch to heatmap view to see stress patterns over time
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
              {/* View mode tabs */}
              <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('points')}
                  className={`py-2 px-4 font-medium text-sm ${
                    viewMode === 'points' 
                      ? darkMode 
                        ? 'text-purple-400 border-b-2 border-purple-400' 
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Point Mode
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`py-2 px-4 font-medium text-sm ${
                    viewMode === 'heatmap'
                      ? darkMode 
                        ? 'text-purple-400 border-b-2 border-purple-400' 
                        : 'text-purple-600 border-b-2 border-purple-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Heatmap Mode
                </button>
              </div>

              {/* Time period filter (only for heatmap view) */}
              {viewMode === 'heatmap' && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedTimePeriod(period.id)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        selectedTimePeriod === period.id
                          ? darkMode 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-500 text-white'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div 
                ref={mapRef}
                onClick={handleMapClick}
                className={`relative w-full h-[500px] ${viewMode === 'points' ? 'cursor-crosshair' : 'cursor-default'}`}
              >
                {/* Body outline SVG */}
                <svg 
                  viewBox="0 0 100 100" 
                  className={`absolute inset-0 w-full h-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {/* Improved body outline with more detailed parts */}
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
                  
                  {/* Add labels to the body parts if needed */}
                  {bodyRegions.map((region) => (
                    <text
                      key={region.id}
                      x={(region.bounds.x1 + region.bounds.x2) / 2}
                      y={(region.bounds.y1 + region.bounds.y2) / 2}
                      textAnchor="middle"
                      fontSize="2"
                      fill={darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                      className="pointer-events-none"
                    >
                      {region.name}
                    </text>
                  ))}
                </svg>
                
                {/* Canvas for heatmap */}
                {viewMode === 'heatmap' && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                )}
                
                {/* Render current points in point mode */}
                {viewMode === 'points' && points.map((point, index) => (
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
                
                {/* Add tooltips for regions when hovering */}
                {bodyRegions.map((region) => (
                  <div
                    key={region.id}
                    className="absolute border-2 border-transparent hover:border-purple-500 rounded-lg opacity-0 hover:opacity-50 transition-opacity"
                    style={{
                      left: `${region.bounds.x1}%`,
                      top: `${region.bounds.y1}%`,
                      width: `${region.bounds.x2 - region.bounds.x1}%`,
                      height: `${region.bounds.y2 - region.bounds.y1}%`,
                    }}
                  />
                ))}
              </div>

              {/* Legend for heatmap */}
              {viewMode === 'heatmap' && (
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${darkMode ? 'bg-blue-700' : 'bg-blue-400'} mr-1`}></div>
                    <span className="text-xs">Low Intensity</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${darkMode ? 'bg-yellow-600' : 'bg-yellow-400'} mr-1`}></div>
                    <span className="text-xs">Medium Intensity</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${darkMode ? 'bg-red-700' : 'bg-red-500'} mr-1`}></div>
                    <span className="text-xs">High Intensity</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
          
          <div>
            <Card className="h-full">
              <div className="h-full flex flex-col">
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {viewMode === 'points' ? 'Stress Intensity' : 'Analysis & Suggestions'}
                </h3>
                
                {viewMode === 'points' && (
                  <>
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
                  </>
                )}

                {viewMode === 'heatmap' && (
                  <>
                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Stress Analysis
                      </h4>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {filteredHistoricalPoints.length === 0 
                            ? 'No historical data available for this period.'
                            : `Based on your ${filteredHistoricalPoints.length} data ${filteredHistoricalPoints.length === 1 ? 'point' : 'points'}, 
                              you tend to experience the most stress in the 
                              ${suggestedExercises.length > 0 
                                ? suggestedExercises[0].region.toLowerCase()
                                : 'body'} region.`
                          }
                        </p>
                      </div>
                    </div>

                    {suggestedExercises.length > 0 && (
                      <div className="mt-4 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Suggested Exercises
                          </h4>
                          <Button
                            onClick={() => setShowExercises(true)}
                            variant="ghost"
                            size="sm"
                            icon={<Activity size={14} />}
                          >
                            View All
                          </Button>
                        </div>
                        
                        <div className="space-y-2 mb-4 flex-grow">
                          {suggestedExercises.slice(0, 3).map((exercise, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}
                              onClick={() => {
                                setActiveExerciseIndex(index);
                                setExerciseAnimation(true);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {exercise.name}
                                  </h5>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    For {exercise.region}
                                  </p>
                                </div>
                                <Play size={16} className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'} mt-auto`}>
                          <div className="flex items-start">
                            <Info size={16} className={`mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <p className={`text-xs ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                              Regular targeted exercises can help reduce tension in your most stressed areas and improve overall wellbeing.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
        
        {/* Exercise animation modal */}
        <AnimatePresence>
          {exerciseAnimation && activeExerciseIndex < suggestedExercises.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`relative w-full max-w-md p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
              >
                <button
                  onClick={() => setExerciseAnimation(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
                
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {suggestedExercises[activeExerciseIndex].name}
                </h3>
                
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Exercise for {suggestedExercises[activeExerciseIndex].region}
                </p>
                
                {/* Example animation - in a real app, you would have actual exercise animations or videos */}
                <div className={`w-full h-64 rounded-lg flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <motion.circle 
                      cx="60" 
                      cy="60" 
                      r="30" 
                      fill="none" 
                      stroke={darkMode ? "#a78bfa" : "#8b5cf6"} 
                      strokeWidth="4" 
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 0],
                        rotate: [0, 180, 360], 
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    />
                    <motion.path
                      d="M60,30 L60,90 M30,60 L90,60"
                      stroke={darkMode ? "#a78bfa" : "#8b5cf6"}
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                  </svg>
                </div>
                
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {/* Example instructions - in a real app, you would have actual exercise instructions */}
                  {suggestedExercises[activeExerciseIndex].name === 'Deep breathing' ? (
                    "Sit comfortably with your back straight. Breathe in slowly through your nose for 4 seconds. Hold your breath for 2 seconds. Exhale slowly through your mouth for 6 seconds. Repeat 5-10 times."
                  ) : suggestedExercises[activeExerciseIndex].name.includes('stretch') ? (
                    "Gently stretch the targeted area, holding for 20-30 seconds. Don't bounce or force the stretch. Breathe deeply and relax into the position. Repeat 3 times on each side."
                  ) : (
                    "Perform this exercise slowly with controlled movements. Focus on proper form rather than speed. Start with 8-10 repetitions and gradually increase as strength improves."
                  )}
                </p>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      const prevIndex = (activeExerciseIndex - 1 + suggestedExercises.length) % suggestedExercises.length;
                      setActiveExerciseIndex(prevIndex);
                    }}
                    variant="outline"
                    className="flex-1"
                    icon={<ArrowLeft size={16} />}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      const nextIndex = (activeExerciseIndex + 1) % suggestedExercises.length;
                      setActiveExerciseIndex(nextIndex);
                    }}
                    className="flex-1"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* View all exercises modal */}
        <AnimatePresence>
          {showExercises && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`relative w-full max-w-lg p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
              >
                <button
                  onClick={() => setShowExercises(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
                
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recommended Exercises
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {suggestedExercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer`}
                      onClick={() => {
                        setActiveExerciseIndex(index);
                        setExerciseAnimation(true);
                        setShowExercises(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {exercise.name}
                          </h5>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            For {exercise.region}
                          </p>
                        </div>
                        <Play size={18} className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'} mt-4`}>
                  <div className="flex items-start">
                    <Calendar size={16} className={`mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                      Try to practice these exercises for 10-15 minutes daily for the best results. Track your progress in the Wellness Journal.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default BodyMap;