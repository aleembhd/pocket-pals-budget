
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetCard from '@/components/budget/BudgetCard';
import ExpenseCard, { Expense } from '@/components/expense/ExpenseCard';
import TodaysSpendCard from '@/components/dashboard/TodaysSpendCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [todaySpent, setTodaySpent] = useState<number>(0);
  const [todayStatus, setTodayStatus] = useState<'good' | 'warning' | 'danger'>('good');
  const [showBudgetAlert, setShowBudgetAlert] = useState<boolean>(false);
  const [lastAlertPercentage, setLastAlertPercentage] = useState<number>(0);
  
  // On first visit, check if we have a budget set
  useEffect(() => {
    const savedBudget = localStorage.getItem('budget');
    if (!savedBudget) {
      navigate('/set-budget');
    } else {
      setBudget(Number(savedBudget));
    }
    
    // Load expenses from localStorage
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses).map((exp: any) => ({
        ...exp,
        date: new Date(exp.date)
      }));
      setExpenses(parsedExpenses);
      
      // Calculate total spent
      const total = parsedExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
      setTotalSpent(total);
      
      // Calculate today's spending
      const today = new Date();
      const todayExpenses = parsedExpenses.filter((exp: Expense) => {
        const expDate = new Date(exp.date);
        return expDate.getDate() === today.getDate() && 
               expDate.getMonth() === today.getMonth() && 
               expDate.getFullYear() === today.getFullYear();
      });
      
      const todayTotal = todayExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
      setTodaySpent(todayTotal);
      
      // Calculate daily budget (budget / days in month)
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dailyBudget = Number(savedBudget) / daysInMonth;
      
      // Set status based on today's spending vs daily budget
      if (todayTotal <= dailyBudget * 0.5) {
        setTodayStatus('good');
      } else if (todayTotal <= dailyBudget) {
        setTodayStatus('warning');
      } else {
        setTodayStatus('danger');
      }

      // Check if we need to show budget alert
      const percentSpent = (total / Number(savedBudget)) * 100;
      const savedLastAlertPercentage = localStorage.getItem('lastAlertPercentage');
      const lastAlert = savedLastAlertPercentage ? Number(savedLastAlertPercentage) : 0;
      setLastAlertPercentage(lastAlert);

      // Show alert at 25%, 50%, 75% thresholds
      const thresholds = [25, 50, 75, 90];
      
      for (const threshold of thresholds) {
        if (percentSpent >= threshold && lastAlert < threshold) {
          setShowBudgetAlert(true);
          setLastAlertPercentage(threshold);
          localStorage.setItem('lastAlertPercentage', threshold.toString());
          break;
        }
      }
    }
  }, [navigate]);

  const handleDismissAlert = () => {
    setShowBudgetAlert(false);
  };

  const percentSpent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  return (
    <AppLayout>
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold dark:text-white"
        >
          Money Tracker
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-gray-600 dark:text-gray-300"
        >
          Track your expenses with ease
        </motion.p>
      </header>
      
      {showBudgetAlert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Budget Alert</AlertTitle>
            <AlertDescription>
              You have spent {lastAlertPercentage}% of your monthly budget. Consider reviewing your expenses.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDismissAlert}
              className="mt-2"
            >
              Dismiss
            </Button>
          </Alert>
        </motion.div>
      )}
      
      <div className="space-y-4">
        {budget > 0 && (
          <BudgetCard 
            budget={budget} 
            spent={totalSpent} 
            onSetBudget={() => navigate('/set-budget')}
          />
        )}
        
        <TodaysSpendCard amount={todaySpent} status={todayStatus} />
      </div>
      
      <div className="flex justify-between items-center mb-4 mt-6">
        <h2 className="font-semibold text-lg dark:text-white">Recent Expenses</h2>
        <Button
          onClick={() => navigate('/add-expense')}
          className="btn-gradient flex items-center gap-1 rounded-full px-4 py-1 h-8"
        >
          <PlusCircle size={16} />
          <span>Add</span>
        </Button>
      </div>
      
      {expenses.length > 0 ? (
        <AnimatePresence>
          {expenses.slice(0, 5).map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </AnimatePresence>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No expenses yet</p>
          <Button
            onClick={() => navigate('/add-expense')}
            className="btn-gradient mt-4"
          >
            Add your first expense
          </Button>
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
