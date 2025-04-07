
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from 'lucide-react';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  date: Date;
  category: 'Savings' | 'Payment' | 'Consistency' | 'Special';
}

interface BadgeCardProps {
  badge: UserBadge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getCategoryColor = () => {
    switch (badge.category) {
      case 'Savings':
        return 'bg-budget-green text-white';
      case 'Payment':
        return 'bg-budget-blue text-white';
      case 'Consistency':
        return 'bg-budget-purple text-white';
      case 'Special':
        return 'bg-budget-yellow text-gray-900';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-gradient rounded-xl p-4 mb-3 shadow-sm"
    >
      <div className="flex items-center">
        <div className={`rounded-full p-2 mr-3 ${getCategoryColor()}`}>
          {badge.icon}
        </div>
        <div>
          <h3 className="font-medium dark:text-white">{badge.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Earned on {new Date(badge.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BadgeCard;
