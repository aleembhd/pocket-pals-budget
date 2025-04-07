import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Wallet,
  Target,
  Star,
  Award,
  TrendingUp,
  Shield,
  Crown
} from 'lucide-react';

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
  isNew?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isNew = false }) => {
  const getCategoryColor = () => {
    switch (badge.category) {
      case 'Savings':
        return 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white';
      case 'Payment':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
      case 'Consistency':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white';
      case 'Special':
        return 'bg-gradient-to-br from-amber-400 to-amber-600 text-gray-900';
      default:
        return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700';
    }
  };

  const getBadgeIcon = () => {
    switch (badge.category) {
      case 'Savings':
        return <Wallet className="w-6 h-6" />;
      case 'Payment':
        return <Target className="w-6 h-6" />;
      case 'Consistency':
        return <TrendingUp className="w-6 h-6" />;
      case 'Special':
        return <Crown className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
    >
      <div className="card-gradient rounded-xl p-4 mb-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`rounded-full p-3 mr-4 ${getCategoryColor()} shadow-lg transform hover:scale-110 transition-transform duration-200`}>
            {getBadgeIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg dark:text-white mb-1">{badge.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Earned on {new Date(badge.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -rotate-45"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BadgeCard;
