
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Coins } from 'lucide-react';

interface TodaysSpendCardProps {
  amount: number;
  status: 'good' | 'warning' | 'danger';
}

const TodaysSpendCard: React.FC<TodaysSpendCardProps> = ({ amount, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'bg-budget-green';
      case 'warning':
        return 'bg-budget-yellow';
      case 'danger':
        return 'bg-budget-red';
      default:
        return 'bg-budget-green';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`${getStatusColor()} rounded-full p-2 mr-3`}>
            <DollarSign size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Spend</h3>
            <p className="text-lg font-bold">₹ {amount.toLocaleString()}</p>
          </div>
        </div>
        <Coins size={24} className="text-gray-400 dark:text-gray-500" />
      </div>
    </motion.div>
  );
};

export default TodaysSpendCard;
