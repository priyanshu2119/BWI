import React from 'react';
import { motion } from 'framer-motion';
import { Flower2, Droplets } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useStore from '../../store/useStore';

const DigitalGarden: React.FC = () => {
  const { user, waterGarden, darkMode } = useStore();
  const { gardenProgress } = user;
  
  const getPlantEmoji = (type: string, stage: number) => {
    if (type === 'tree') {
      return stage <= 1 ? '🌱' : stage <= 3 ? '🌿' : '🌳';
    } else if (type === 'flower') {
      return stage <= 1 ? '🌱' : stage <= 3 ? '🌿' : '🌸';
    } else {
      return stage <= 1 ? '🌱' : stage <= 3 ? '🌿' : '🌵';
    }
  };
  
  const canWater = () => {
    const lastWatered = new Date(gardenProgress.lastWatered);
    const now = new Date();
    return now.getDate() !== lastWatered.getDate();
  };
  
  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Your Garden
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Level {gardenProgress.level} • {gardenProgress.plants.length} plants
          </p>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          icon={<Droplets size={16} />}
          onClick={waterGarden}
          disabled={!canWater()}
        >
          Water
        </Button>
      </div>
      
      <div className="h-32 bg-gradient-to-b from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg mb-4 relative overflow-hidden">
        {gardenProgress.plants.map((plant, index) => (
          <motion.div
            key={plant.id}
            className="absolute text-4xl"
            style={{
              bottom: '10px',
              left: `${20 + (index * 60)}px`,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            {getPlantEmoji(plant.type, plant.stage)}
          </motion.div>
        ))}
      </div>
      
      <div className="text-center">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your garden grows as you complete mental wellness activities
        </p>
        
        {!canWater() && (
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You've already watered your garden today. Come back tomorrow!
          </p>
        )}
      </div>
    </Card>
  );
};

export default DigitalGarden;