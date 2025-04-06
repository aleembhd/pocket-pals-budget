
import React from 'react';
import { Calendar, CreditCard, Smartphone, Coins, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PaymentMode } from './PaymentModeSelector';
import { motion } from 'framer-motion';

export interface Expense {
  id: string;
  amount: number;
  paymentMode: PaymentMode;
  date: Date;
  description?: string;
}

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const getPaymentIcon = () => {
    switch (expense.paymentMode) {
      case 'Card':
        return <CreditCard className="text-budget-blue" size={20} />;
      case 'UPI':
        return <Smartphone className="text-budget-green" size={20} />;
      case 'Cash':
        return <Coins className="text-budget-yellow" size={20} />;
      case 'Online':
        return <ArrowUpRight className="text-budget-purple" size={20} />;
      default:
        return null;
    }
  };
  
  // Format time like "2 hours ago" or "3 days ago"
  const timeAgo = formatDistanceToNow(expense.date, { addSuffix: true });
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="card-gradient rounded-xl p-4 mb-3"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            {getPaymentIcon()}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {expense.description || expense.paymentMode}
            </p>
            <div className="flex items-center text-gray-500 text-xs">
              <Calendar size={12} className="mr-1" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">₹ {expense.amount}</p>
          <p className="text-xs text-gray-500">{expense.paymentMode}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseCard;
