import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Sky, useTexture, Html, Environment, Sparkles, Text, useGLTF } from '@react-three/drei';
import { Physics, usePlane } from '@react-three/cannon';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Info, Droplets, Flower2, Cloud, Tree, Leaf, SunMedium, Moon, Wind } from 'lucide-react';
import useStore from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';

// Extend Three.js with MapControls for better navigation
extend({ MapControls });

// Plant types and their 3D models
const PLANT_TYPES = {
  TREE: 'tree',
  FLOWER: 'flower',
  BUSH: 'bush',
  HERB: 'herb'
};

// Growth stages
const GROWTH_STAGES = {
  SEED: 1,
  SPROUT: 2,
  GROWING: 3,
  MATURE: 4,
  BLOOMING: 5
};

// Update the GardenTree component with proper type annotations
interface GardenTreeProps {
  position: [number, number, number];
  scale: number;
  type: string;
  growthStage: number;
  onClick?: () => void;
  color?: number | string;
}

const GardenTree: React.FC<GardenTreeProps> = ({ position, scale, type, growthStage, onClick, color }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  
  // Animate growth based on stage
  useFrame(() => {
    if (meshRef.current && groupRef.current) {
      // Gentle swaying animation
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
      
      // Scale based on growth stage
      const targetScale = scale * (0.2 + (growthStage * 0.2));
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
  });

  const getTreeColor = () => {
    // Base colors with slight variations
    const leafColors = {
      tree: new THREE.Color(color || 0x4ade80),
      'emotion-tree': new THREE.Color(color || 0x4ade80),
      flower: new THREE.Color(color || 0xfbbf24),
      'achievement-flower': new THREE.Color(color || 0xfbbf24),
      bush: new THREE.Color(color || 0x22c55e),
      herb: new THREE.Color(color || 0x34d399)
    };
    
    return leafColors[type] || leafColors.tree;
  };
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onClick}
    >
      {growthStage > GROWTH_STAGES.SEED && (
        <>
          {/* Tree trunk */}
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          
          {/* Tree foliage - changes with growth stage */}
          <group ref={meshRef} position={[0, 0.8, 0]}>
            {growthStage >= GROWTH_STAGES.SPROUT && (
              <mesh castShadow>
                {type === PLANT_TYPES.TREE || type === 'emotion-tree' ? (
                  <coneGeometry args={[0.6, 1.2, 8]} />
                ) : type === PLANT_TYPES.FLOWER || type === 'achievement-flower' ? (
                  <dodecahedronGeometry args={[0.6, 0]} />
                ) : type === PLANT_TYPES.BUSH ? (
                  <sphereGeometry args={[0.6, 16, 16]} />
                ) : type === PLANT_TYPES.HERB ? (
                  <octahedronGeometry args={[0.5, 0]} />
                ) : (
                  // Default fallback
                  <coneGeometry args={[0.6, 1.2, 8]} />
                )}
                <meshStandardMaterial 
                  color={getTreeColor()} 
                  roughness={0.8}
                />
              </mesh>
            )}
            
            {/* Flowers appear at blooming stage */}
            {growthStage >= GROWTH_STAGES.BLOOMING && type === PLANT_TYPES.FLOWER && (
              <Sparkles 
                count={20} 
                scale={1.2} 
                size={0.6} 
                speed={0.3} 
                color={new THREE.Color(0xfef3c7)} 
              />
            )}
          </group>
        </>
      )}
      
      {growthStage === GROWTH_STAGES.SEED && (
        <mesh castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#5d4037" roughness={0.7} />
        </mesh>
      )}
    </group>
  );
};

// Update the Ground component
interface GroundProps {
  onPlant: (position: [number, number, number]) => void;
}

const Ground: React.FC<GroundProps> = ({ onPlant }) => {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.1, 0]
  }));
  
  const textures = useTexture({
    map: '/textures/grass.jpg',
    displacementMap: '/textures/grass_disp.jpg',
    normalMap: '/textures/grass_normal.jpg',
    roughnessMap: '/textures/grass_rough.jpg',
  });
  
  // When loaded, repeat textures to cover ground
  useEffect(() => {
    Object.values(textures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
    });
  }, [textures]);
  
  return (
    <mesh 
      ref={ref} 
      receiveShadow 
      onClick={(e) => {
        if (onPlant) {
          e.stopPropagation();
          // Convert click coordinates to world position
          onPlant(e.point);
        }
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        {...textures}
        displacementScale={0.2}
      />
    </mesh>
  );
};

// Update DayNightCycle component
interface DayNightCycleProps {
  timeOfDay: number;
}

const DayNightCycle: React.FC<DayNightCycleProps> = ({ timeOfDay }) => {
  const sunPosition = [
    100 * Math.cos(timeOfDay * Math.PI),
    100 * Math.sin(timeOfDay * Math.PI),
    0
  ];
  
  return (
    <>
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        inclination={timeOfDay} 
        azimuth={0.25} 
      />
      
      <ambientLight intensity={0.2 + 0.8 * Math.max(0, Math.sin(timeOfDay * Math.PI))} />
      <directionalLight
        position={sunPosition}
        intensity={1.5 * Math.max(0.2, Math.sin(timeOfDay * Math.PI))}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
};

// Water component
const Water = () => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Animate water surface
      meshRef.current.position.y = -0.1 + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[15, -0.1, 15]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[8, 32]} />
      <meshStandardMaterial 
        color={new THREE.Color(0x2563eb)}
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.1}
      />
      <Sparkles 
        count={50} 
        scale={16} 
        size={0.5} 
        speed={0.4} 
        color={new THREE.Color(0x93c5fd)} 
      />
    </mesh>
  );
};

// Loading indicator
const LoadingIndicator = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">Loading your garden...</p>
      </div>
    </Html>
  );
};

// Custom camera controls
const CameraControls = ({ darkMode }) => {
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = useRef();
  
  // Update camera position
  useEffect(() => {
    if (controls.current) {
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
      controls.current.update();
    }
  }, [camera]);
  
  return (
    <OrbitControls
      ref={controls}
      args={[camera, domElement]}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.1}
      target={[0, 0, 0]}
    />
  );
};

// Add this optimization function
const optimizeRendering = (state) => {
  // Adjust renderer settings based on device capability
  if (state.gl) {
    state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update quality setting based on device performance
    if (window.devicePixelRatio < 1.5) {
      setQuality('low');
    }
  }
};

// Main TherapyGarden component with proper data handling
const TherapyGarden: React.FC = () => {
  const { user = {}, waterGarden, plantInGarden, darkMode = false, currentMood = 'neutral' } = useStore();
  const { gardenProgress = { plants: [], lastWatered: 0 } } = user || {};
  
  // State for garden interactions
  const [plantingMode, setPlantingMode] = useState(false);
  const [selectedPlantType, setSelectedPlantType] = useState(PLANT_TYPES.TREE);
  const [dayTime, setDayTime] = useState(0.3); // Start at morning
  const [wateringPlant, setWateringPlant] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState('high');
  
  // Check if WebGL is supported
  const [webGLSupported] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  });
  
  // Loading state management
  useEffect(() => {
    if (user && user.id) {
      setIsLoading(false);
    }
  }, [user]);

  // Generate plant color based on user mood
  const getMoodColor = () => {
    const moodColors = {
      happy: 0x4ade80, // Green
      sad: 0x93c5fd,   // Blue
      angry: 0xf87171, // Red
      anxious: 0xfbbf24, // Yellow
      neutral: 0x60a5fa, // Light blue
    };
    
    return moodColors[currentMood] || moodColors.neutral;
  };
  
  // Add a new plant to the garden
  const handlePlantSeed = (position) => {
    if (plantingMode) {
      const newPlant = {
        id: uuidv4(),
        type: selectedPlantType,
        position: [position.x, 0, position.z],
        stage: GROWTH_STAGES.SEED,
        plantedAt: Date.now(),
        lastWatered: Date.now(),
        color: getMoodColor()
      };
      
      plantInGarden(newPlant);
      setPlantingMode(false);
    }
  };
  
  // Water a specific plant
  const handleWaterPlant = (plantId) => {
    setWateringPlant(plantId);
    waterGarden(plantId);
    
    // Reset watering animation after a delay
    setTimeout(() => {
      setWateringPlant(null);
    }, 2000);
  };
  
  // Simulate day/night cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setDayTime((prevTime) => (prevTime + 0.001) % 1);
    }, 100);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate if user can plant a new seed
  const canPlant = () => {
    if (!user || !user.level) return false;
    // Limit plants based on user level
    return (gardenProgress?.plants?.length || 0) < (user.level * 3);
  };

  // Calculate if user can water plants today
  const canWater = () => {
    if (!gardenProgress) return false;
    const lastWatered = gardenProgress.lastWatered || 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return new Date(lastWatered).setHours(0, 0, 0, 0) < today;
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        >
          Therapy Garden
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Nurture your mind by growing plants that represent your emotional journey.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <Card className="h-full">
              <div className="h-full flex flex-col">
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Garden Tools
                </h2>
                
                <div className="space-y-4 flex-1">
                  <Button
                    onClick={() => setPlantingMode(true)}
                    disabled={!canPlant() || plantingMode}
                    fullWidth
                    icon={<Flower2 size={16} />}
                    variant={plantingMode ? "default" : "outline"}
                  >
                    {plantingMode ? 'Select planting location' : 'Plant New Seed'}
                  </Button>
                  
                  {plantingMode && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Choose plant type:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(PLANT_TYPES).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedPlantType(type)}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              selectedPlantType === type
                                ? darkMode 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-purple-500 text-white'
                                : darkMode
                                  ? 'bg-gray-600 text-gray-300'
                                  : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPlantingMode(false)}
                        className={`w-full mt-2 px-3 py-1 rounded text-xs ${
                          darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Garden Statistics
                    </p>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex justify-between mb-2">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plants:</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {gardenProgress.plants.length}/{user.level * 3}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mature plants:</span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {gardenProgress.plants.filter(p => p.stage >= GROWTH_STAGES.MATURE).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setShowTutorial(true)}
                    variant="ghost"
                    fullWidth
                    icon={<Info size={16} />}
                  >
                    How To Use
                  </Button>
                </div>
                
                <div className={`mt-4 p-3 rounded-lg ${
                  darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start">
                    <Cloud size={16} className={`mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                      Your garden reflects your emotional growth. Plants grow as you log moods and complete wellness activities.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 h-[600px]"
          >
            <Card className="h-full p-0 overflow-hidden">
              <div className="relative h-full">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={() => setDayTime(0.3)} // Morning
                    className={`p-2 rounded-full ${
                      dayTime < 0.5
                        ? 'bg-yellow-500 text-white'
                        : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                    }`}
                  >
                    <SunMedium size={16} />
                  </button>
                  <button
                    onClick={() => setDayTime(0.8)} // Night
                    className={`p-2 rounded-full ${
                      dayTime >= 0.5
                        ? 'bg-indigo-600 text-white'
                        : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                    }`}
                  >
                    <Moon size={16} />
                  </button>
                </div>
                
                {/* 3D Garden Scene */}
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>Loading your garden...</p>
                  </div>
                ) : !webGLSupported ? (
                  <div className="flex items-center justify-center h-full p-6 text-center">
                    <div>
                      <p className={`text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Your browser doesn't support WebGL
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Try using a modern browser like Chrome, Firefox, or Edge to view the 3D garden.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Canvas 
                    shadows 
                    gl={{ antialias: true }} 
                    onCreated={optimizeRendering}
                  >
                    <Suspense fallback={<LoadingIndicator />}>
                      <fog attach="fog" args={[0xffffff, 0.1, 100]} />
                      <Physics>
                        <Ground onPlant={handlePlantSeed} />
                        
                        {/* Safely render plants with optional chaining */}
                        {gardenProgress?.plants?.map((plant, index) => (
                          <GardenTree
                            key={plant.id}
                            position={plant.position}
                            scale={1}
                            type={plant.type}
                            growthStage={plant.stage}
                            color={plant.color}
                            onClick={() => handleWaterPlant(plant.id)}
                          />
                        ))}
                        
                        {wateringPlant && (
                          <Sparkles
                            position={gardenProgress?.plants?.find(p => p.id === wateringPlant)?.position}
                            count={20}
                            scale={1}
                            size={0.5}
                            speed={0.5}
                            color={new THREE.Color(0x3b82f6)}
                          />
                        )}
                        
                        <Water />
                        <DayNightCycle timeOfDay={dayTime} />
                        <Environment preset="park" />
                      </Physics>
                      
                      <CameraControls darkMode={darkMode} />
                    </Suspense>
                  </Canvas>
                )}
                
                {plantingMode && (
                  <div className="absolute left-0 bottom-0 m-4 p-3 rounded-lg bg-black bg-opacity-70 text-white text-sm">
                    Click anywhere on the ground to plant your seed
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
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
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
                
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  How To Use Your Therapy Garden
                </h3>
                
                <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex">
                    <Flower2 className="flex-shrink-0 mr-3 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Plant Seeds</p>
                      <p className="text-sm">Click the "Plant New Seed" button and select a location in your garden to plant.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Droplets className="flex-shrink-0 mr-3 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Water Your Plants</p>
                      <p className="text-sm">Click on any plant to water it. Regular watering helps plants grow faster.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Leaf className="flex-shrink-0 mr-3 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Growth Stages</p>
                      <p className="text-sm">Plants grow through several stages: seed, sprout, growing, mature, and blooming.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Wind className="flex-shrink-0 mr-3 mt-1" size={18} />
                    <div>
                      <p className="font-medium">Environment Controls</p>
                      <p className="text-sm">Toggle between day and night modes using the buttons in the top right.</p>
                    </div>
                  </div>
                </div>
                
                <div className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-purple-900 bg-opacity-20' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                    Your garden grows as you progress in your wellness journey. Log moods, complete wellness activities, and visit regularly to see your garden flourish.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default TherapyGarden;