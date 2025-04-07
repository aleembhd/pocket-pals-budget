
import React from 'react';
import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileLevelProps {
  userLevel: number;
  userXp: number;
  xpNeededForNextLevel: number;
  xpProgress: number;
}

const ProfileLevel: React.FC<ProfileLevelProps> = ({ 
  userLevel, 
  userXp, 
  xpNeededForNextLevel, 
  xpProgress 
}) => {
  return (
    <div className="mt-2">
      <div className="flex items-center mb-3">
        <div className="bg-cyan-100 rounded-full p-3 mr-3 inline-block">
          <Trophy size={24} className="text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold dark:text-white">Level {userLevel}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{userXp} / {xpNeededForNextLevel} XP</p>
        </div>
      </div>
      
      <Progress value={xpProgress} className="h-2 bg-gray-100" />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Earn XP by tracking expenses, adding goals, and saving money!</p>
    </div>
  );
};

export default ProfileLevel;
