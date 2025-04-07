
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
}

interface GoalCardProps {
  goal: Goal;
  onAddFunds: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onAddFunds }) => {
  const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient rounded-xl p-4 mb-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="bg-primary/10 rounded-full p-2 mr-3">
            <Target size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-medium dark:text-white">{goal.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ₹{goal.currentAmount.toLocaleString()} of ₹{goal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>
        
        <Button 
          size="sm" 
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          onClick={() => onAddFunds(goal.id)}
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-300">{progressPercentage}% complete</span>
          {goal.deadline && (
            <span className="text-gray-600 dark:text-gray-300">
              Due: {goal.deadline.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GoalCard;
