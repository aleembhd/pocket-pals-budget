
import React from 'react';
import { CircleDollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface BudgetCardProps {
  budget: number;
  spent: number;
  onSetBudget?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, spent, onSetBudget }) => {
  const remaining = budget - spent;
  const percentSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  
  // Determine color based on percent spent
  const getProgressColor = () => {
    if (percentSpent < 50) return 'bg-budget-green';
    if (percentSpent < 80) return 'bg-budget-yellow';
    return 'bg-budget-red';
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient rounded-xl p-5 mb-6"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <CircleDollarSign className="text-primary mr-2" size={22} />
          <h2 className="font-semibold text-lg dark:text-white">Monthly Budget</h2>
        </div>
        {onSetBudget && (
          <button 
            onClick={onSetBudget} 
            className="text-primary text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600 dark:text-gray-300 text-sm">Total Budget</span>
        <span className="font-semibold dark:text-white">₹ {budget.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <TrendingDown className="text-budget-red mr-1" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-300">Spent: <span className="font-medium dark:text-white">₹ {spent.toLocaleString()}</span></span>
        </div>
        <div className="flex items-center">
          <TrendingUp className="text-budget-green mr-1" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-300">Left: <span className="font-medium text-budget-green dark:text-budget-green font-bold">₹ {remaining.toLocaleString()}</span></span>
        </div>
      </div>
      
      <Progress value={percentSpent} className="h-2 bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${getProgressColor()} rounded-full`} style={{ width: `${percentSpent}%` }}></div>
      </Progress>
      
      <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-300">{percentSpent.toFixed(0)}% spent</p>
    </motion.div>
  );
};

export default BudgetCard;
