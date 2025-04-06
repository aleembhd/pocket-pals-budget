
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetCard from '@/components/budget/BudgetCard';
import ExpenseCard, { Expense } from '@/components/expense/ExpenseCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  
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
    }
  }, [navigate]);

  return (
    <AppLayout>
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Money Tracker
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-gray-600"
        >
          Track your expenses with ease
        </motion.p>
      </header>
      
      {budget > 0 && (
        <BudgetCard 
          budget={budget} 
          spent={totalSpent} 
          onSetBudget={() => navigate('/set-budget')}
        />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Recent Expenses</h2>
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
          <p className="text-gray-500">No expenses yet</p>
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
