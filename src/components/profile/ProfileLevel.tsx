
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
      <div className="bg-primary/10 rounded-full p-3 mr-3 inline-block float-left">
        <Trophy size={24} className="text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold dark:text-white">Level {userLevel}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">{userXp} / {xpNeededForNextLevel} XP</p>
      </div>
      
      <Progress value={xpProgress} className="h-2 mt-2 mb-1" />
      <p className="text-xs text-gray-500 dark:text-gray-400">Earn XP by tracking expenses, adding goals, and saving money!</p>
    </div>
  );
};

export default ProfileLevel;
