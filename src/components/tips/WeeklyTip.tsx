
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expense } from '@/components/expense/ExpenseCard';

interface WeeklyTipProps {
  expenses: Expense[];
}

const WeeklyTip: React.FC<WeeklyTipProps> = ({ expenses }) => {
  const [showTip, setShowTip] = useState(false);
  const [tip, setTip] = useState('');
  
  useEffect(() => {
    // Check if we should show a tip
    const lastTipDate = localStorage.getItem('lastTipDate');
    const today = new Date();
    
    if (!lastTipDate || new Date(lastTipDate).getTime() < today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      // It's been more than a week since the last tip
      setTimeout(() => {
        generateTip(expenses);
        setShowTip(true);
        localStorage.setItem('lastTipDate', today.toISOString());
      }, 2000); // Show tip after 2 seconds
    }
  }, [expenses]);
  
  const generateTip = (expenses: Expense[]) => {
    if (expenses.length === 0) {
      setTip("Start tracking your expenses to get personalized insights!");
      return;
    }
    
    // Get expenses from last week
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastWeekExpenses = expenses.filter(expense => 
      new Date(expense.date) >= lastWeek && new Date(expense.date) <= today
    );
    
    const lastTwoWeeksExpenses = expenses.filter(expense => 
      new Date(expense.date) >= new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000) && 
      new Date(expense.date) <= lastWeek
    );
    
    // Calculate total spent this week and last week
    const thisWeekTotal = lastWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const prevWeekTotal = lastTwoWeeksExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group expenses by payment mode (as a proxy for category)
    const expensesByMode: Record<string, number> = {};
    
    lastWeekExpenses.forEach(expense => {
      if (!expensesByMode[expense.paymentMode]) {
        expensesByMode[expense.paymentMode] = 0;
      }
      expensesByMode[expense.paymentMode] += expense.amount;
    });
    
    // Find top category
    let topCategory = '';
    let topAmount = 0;
    
    Object.keys(expensesByMode).forEach(mode => {
      if (expensesByMode[mode] > topAmount) {
        topAmount = expensesByMode[mode];
        topCategory = mode;
      }
    });
    
    // Generate tip based on data
    if (prevWeekTotal > 0 && thisWeekTotal < prevWeekTotal) {
      // User spent less this week
      const percentLess = Math.round(((prevWeekTotal - thisWeekTotal) / prevWeekTotal) * 100);
      setTip(`You spent ${percentLess}% less than last week! Keep going. 🎉`);
    } else if (prevWeekTotal > 0 && thisWeekTotal > prevWeekTotal) {
      // User spent more this week
      const percentMore = Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100);
      setTip(`Your spending increased by ${percentMore}% compared to last week. 📈`);
    } else if (topCategory) {
      // Provide insight on top spending category
      setTip(`Top category: ${topCategory} – ₹${topAmount.toLocaleString()} this week. 💡`);
    } else {
      // Generic tip
      setTip("Keep tracking your expenses to see more personalized insights!");
    }
  };
  
  const closeTip = () => {
    setShowTip(false);
  };

  return (
    <AnimatePresence>
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-0 right-0 mx-auto w-11/12 max-w-sm z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <Lightbulb size={18} className="text-primary mr-2" />
                <h3 className="font-medium text-sm dark:text-white">Weekly Smart Tip</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 rounded-full" 
                onClick={closeTip}
              >
                <X size={14} />
              </Button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyTip;
